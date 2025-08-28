from flask import Flask, request, jsonify
from flask_cors import CORS
from flask_sqlalchemy import SQLAlchemy
import whisper
import os
import tempfile
import time
import subprocess
import threading

app = Flask(__name__)
CORS(app)

# Use absolute path for SQLite DB to avoid path issues
import os
basedir = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', 'instance'))
app.config['SQLALCHEMY_DATABASE_URI'] = f'sqlite:///{os.path.join(basedir, "educational_app.db")}'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
db = SQLAlchemy(app)

# Models
class Student(db.Model):
    __tablename__ = "students"
    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    nickname = db.Column(db.Text, nullable=False)
    grade_level = db.Column(db.Text, nullable=False)
    section = db.Column(db.Text, nullable=False)
    sessions = db.relationship('Session', backref='student', lazy=True)
    quiz_scores = db.relationship('QuizScore', backref='student', lazy=True)
    transcriptions = db.relationship('Transcription', backref='student', lazy=True)

class Session(db.Model):
    __tablename__ = "sessions"
    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    student_id = db.Column(db.Integer, db.ForeignKey('students.id', ondelete='CASCADE'), nullable=False)
    type = db.Column(db.Text, nullable=False)
    timestamp = db.Column(db.DateTime, default=db.func.current_timestamp())
    transcriptions = db.relationship('Transcription', backref='session', lazy=True)

class Quiz(db.Model):
    __tablename__ = "quizzes"
    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    name = db.Column(db.Text, nullable=False)
    description = db.Column(db.Text)
    quiz_scores = db.relationship('QuizScore', backref='quiz', lazy=True)

class QuizScore(db.Model):
    __tablename__ = "quiz_scores"
    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    student_id = db.Column(db.Integer, db.ForeignKey('students.id', ondelete='CASCADE'), nullable=False)
    quiz_id = db.Column(db.Integer, db.ForeignKey('quizzes.id', ondelete='CASCADE'), nullable=False)
    score = db.Column(db.Float, nullable=False)
    timestamp = db.Column(db.DateTime, default=db.func.current_timestamp())

class Transcription(db.Model):
    __tablename__ = "transcriptions"
    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    text = db.Column(db.Text, nullable=False)
    language = db.Column(db.Text)
    duration = db.Column(db.Float)
    processing_time = db.Column(db.Float)
    timestamp = db.Column(db.DateTime, default=db.func.current_timestamp())
    student_id = db.Column(db.Integer, db.ForeignKey('students.id', ondelete='SET NULL'), nullable=True)
    session_id = db.Column(db.Integer, db.ForeignKey('sessions.id', ondelete='SET NULL'), nullable=True)

# Load Whisper model
model = whisper.load_model("small.en")

@app.route('/api/transcribe', methods=['POST'])
def transcribe_audio():
    if 'audio' not in request.files:
        return jsonify({'error': 'No file uploaded'}), 400

    audio_file = request.files['audio']
    temp_dir = tempfile.mkdtemp()
    temp_path = os.path.join(temp_dir, audio_file.filename)
    audio_file.save(temp_path)

    try:
        if not os.path.exists(temp_path) or os.path.getsize(temp_path) == 0:
            return jsonify({'error': 'Invalid audio file'}), 400

        start_time = time.time()
        result = model.transcribe(
            temp_path,
            fp16=False,
            language='en',
            verbose=True
        )
        duration = time.time() - start_time

        print(f"Transcription successful in {duration:.2f}s")
        return jsonify({
            'text': result['text'],
            'language': result.get('language'),
            'duration': result.get('duration'),
            'processing_time': duration
        })

    except Exception as e:
        print(f"Transcription error: {str(e)}")
        return jsonify({'error': str(e)}), 500

    finally:
        try:
            if os.path.exists(temp_path):
                os.unlink(temp_path)
            if os.path.exists(temp_dir):
                os.rmdir(temp_dir)
        except Exception as e:
            print(f"Error cleaning up temp files: {str(e)}")

@app.route('/api/save-transcription', methods=['POST'])
def save_transcription():
    data = request.get_json()
    if not data or 'text' not in data:
        return jsonify({'error': 'No transcription text provided'}), 400

    duration_value = data.get('processing_time')
    transcription = Transcription(
        text=data['text'],
        language=data.get('language'),
        duration=duration_value,
        processing_time=data.get('processing_time'),
        student_id=data.get('student_id'),
        session_id=data.get('session_id')
    )
    db.session.add(transcription)
    db.session.commit()

    return jsonify({'message': 'Transcription saved', 'id': transcription.id}), 201

@app.route('/api/transcriptions', methods=['GET'])
def get_transcriptions():
    transcriptions = Transcription.query.order_by(Transcription.id.asc()).all()
    result = [{
        'id': t.id,
        'text': t.text,
        'language': t.language,
        'duration': t.duration,
        'processing_time': t.processing_time,
        'timestamp': t.timestamp.isoformat(),
        'student_id': t.student_id,
        'session_id': t.session_id
    } for t in transcriptions]
    return jsonify(result)

@app.route('/api/students', methods=['GET'])
def get_students():
    students = Student.query.all()
    print(f"Found {len(students)} students")  # Debug output
    result = [{
        'id': s.id,
        'nickname': s.nickname,
        'grade_level': s.grade_level,
        'section': s.section
    } for s in students]
    return jsonify(result)

@app.route('/api/sessions', methods=['GET'])
def get_sessions():
    sessions = Session.query.all()
    result = [{
        'id': sess.id,
        'student_id': sess.student_id,
        'type': sess.type,
        'timestamp': sess.timestamp.isoformat() if sess.timestamp else None
    } for sess in sessions]
    return jsonify(result)

@app.route('/api/quizzes', methods=['GET'])
def get_quizzes():
    quizzes = Quiz.query.all()
    result = [{
        'id': q.id,
        'name': q.name,
        'description': q.description
    } for q in quizzes]
    return jsonify(result)

@app.route('/api/quiz_scores', methods=['GET'])
def get_quiz_scores():
    quiz_scores = QuizScore.query.all()
    result = [{
        'id': qs.id,
        'student_id': qs.student_id,
        'quiz_id': qs.quiz_id,
        'score': qs.score,
        'timestamp': qs.timestamp.isoformat() if qs.timestamp else None
    } for qs in quiz_scores]
    return jsonify(result)

@app.route('/api/run-app', methods=['POST'])
def run_app():
    def run_app_py():
        try:
            process = subprocess.Popen(['python', 'src/app.py'], stdout=subprocess.PIPE, stderr=subprocess.PIPE)
            stdout, stderr = process.communicate()
            print(f"Command output: {stdout.decode()}")
            if stderr:
                print(f"Command error: {stderr.decode()}")
        except Exception as e:
            print(f"Error running command: {str(e)}")

    thread = threading.Thread(target=run_app_py)
    thread.start()
    return jsonify({'message': 'Command started'}), 202

if __name__ == '__main__':
    with app.app_context():
        db.create_all()  # Safe — won't overwrite existing tables or data
    app.run(debug=True, host='0.0.0.0', port=5001)
