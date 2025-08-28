INSERT INTO students (nickname, grade_level, section) VALUES
('Alice', 'Kindergarten', 'A'),
('Bob', 'Kindergarten', 'B'),
('Charlie', 'Kindergarten', 'A');

-- Insert sessions
INSERT INTO sessions (student_id, type, timestamp) VALUES
(1, 'speech', '2024-06-01 09:00:00'),
(1, 'quiz', '2024-06-01 10:00:00'),
(2, 'speech', '2024-06-01 09:30:00'),
(3, 'quiz', '2024-06-01 11:00:00');

-- Insert transcriptions
INSERT INTO transcriptions (text, language, duration, processing_time, timestamp, student_id, session_id) VALUES
('Hello world', 'en', 2.5, 3.0, '2024-06-01 09:00:10', 1, 1),
('I like apples', 'en', 1.8, 2.0, '2024-06-01 09:00:20', 1, 1),
('Good morning', 'en', 2.0, 2.5, '2024-06-01 09:30:10', 2, 3);

-- Insert quizzes
INSERT INTO quizzes (name, description) VALUES
('Alphabet Quiz', 'Test on alphabet letters'),
('Number Quiz', 'Test on numbers 1 to 10');

-- Insert quiz_scores
INSERT INTO quiz_scores (student_id, quiz_id, score, timestamp) VALUES
(1, 1, 95.0, '2024-06-01 10:05:00'),
(3, 2, 88.5, '2024-06-01 11:10:00');

COMMIT;
