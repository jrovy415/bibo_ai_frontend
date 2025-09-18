import { Modal, Typography, Tag, Card } from "antd";
import { PlayCircleOutlined, ReadOutlined, GlobalOutlined, StarFilled } from "@ant-design/icons";

const { Title, Paragraph } = Typography;

const typeColors = {
  youtube: "#ff4757", // Bright red
  story: "#5352ed",   // Purple
  link: "#00d2d3",    // Teal
};

const typeIcons = {
  youtube: <PlayCircleOutlined style={{ fontSize: '1.2em' }} />,
  story: <ReadOutlined style={{ fontSize: '1.2em' }} />,
  link: <GlobalOutlined style={{ fontSize: '1.2em' }} />,
};

const QuizMaterial = ({ visible, onClose, material }) => {
  if (!material) {
    return (
      <Modal
        open={visible}
        onCancel={onClose}
        footer={null}
        title={
          <span style={{
            fontSize: '1.5rem',
            color: '#ff6b6b',
            fontFamily: 'Comic Sans MS, cursive, sans-serif',
          }}>
            📚 Learning Material
          </span>
        }
        centered
        width={1000}
        styles={{
          mask: { backgroundColor: 'rgba(0, 0, 0, 0.3)' }
        }}
      >
        <div style={{
          textAlign: 'center',
          padding: '40px 20px',
          background: 'linear-gradient(135deg, #ffeaa7 0%, #fab1a0 100%)',
          borderRadius: '16px',
          color: '#2d3436'
        }}>
          <div style={{ fontSize: '4rem', marginBottom: '16px' }}>📝</div>
          <p style={{
            fontSize: '1.2rem',
            fontFamily: 'Comic Sans MS, cursive, sans-serif',
            margin: 0
          }}>
            No learning material added yet!
          </p>
          <p style={{
            fontSize: '1rem',
            opacity: 0.8,
            marginTop: '8px',
            fontFamily: 'Comic Sans MS, cursive, sans-serif'
          }}>
            Ask your teacher to add some fun content! 🌟
          </p>
        </div>
      </Modal>
    );
  }

  return (
    <Modal
      open={visible}
      onCancel={onClose}
      footer={null}
      title={
        <span style={{
          fontSize: '1.5rem',
          color: '#ff6b6b',
          fontFamily: 'Comic Sans MS, cursive, sans-serif',
        }}>
          📚 Learning Material
        </span>
      }
      centered
      width={1000}
      styles={{
        mask: { backgroundColor: 'rgba(0, 0, 0, 0.3)' },
        body: {
          background: 'linear-gradient(135deg, #ffecd2 0%, #fcb69f 100%)',
          borderRadius: '16px',
          padding: '24px',
        }
      }}
    >
      {/* Header Section */}
      {material.title && (
        <div style={{
          marginBottom: '24px',
          textAlign: 'center',
          animation: 'bounce 0.6s ease-out'
        }}>
          <Title
            level={2}
            style={{
              color: '#2d3436',
              marginBottom: '12px',
              fontFamily: 'Comic Sans MS, cursive, sans-serif',
              textShadow: '2px 2px 4px rgba(0,0,0,0.1)',
              fontSize: '2rem'
            }}
          >
            ✨ {material.title} ✨
          </Title>

          <Tag
            icon={typeIcons[material.type]}
            color={typeColors[material.type] || "default"}
            style={{
              fontSize: '1rem',
              padding: '8px 16px',
              borderRadius: '20px',
              fontFamily: 'Comic Sans MS, cursive, sans-serif',
              fontWeight: 'bold',
              border: 'none',
              boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
              transform: 'scale(1)',
              transition: 'transform 0.2s ease'
            }}
            className="material-tag"
          >
            {material.type.toUpperCase()}
          </Tag>
        </div>
      )}

      {/* Content Card */}
      <Card
        style={{
          background: 'linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%)',
          borderRadius: '20px',
          padding: '20px',
          textAlign: 'center',
          boxShadow: '0 8px 32px rgba(0,0,0,0.12)',
          border: '3px solid #fdcb6e',
          position: 'relative',
          overflow: 'hidden'
        }}
      >
        {/* Decorative stars */}
        <div style={{
          position: 'absolute',
          top: '10px',
          right: '10px',
          color: '#fdcb6e',
          fontSize: '1.5rem'
        }}>
          <StarFilled />
        </div>
        <div style={{
          position: 'absolute',
          top: '10px',
          left: '10px',
          color: '#fd79a8',
          fontSize: '1.2rem'
        }}>
          <StarFilled />
        </div>

        {/* YouTube Video */}
        {material.type === "youtube" && (
          <div style={{ position: 'relative' }}>
            <div style={{
              fontSize: '3rem',
              marginBottom: '16px',
              animation: 'pulse 2s infinite'
            }}>
              🎬
            </div>
            <iframe
              width="100%"
              height="350"
              src={material.content.replace("watch?v=", "embed/")}
              frameBorder="0"
              allowFullScreen
              style={{
                borderRadius: '16px',
                boxShadow: '0 6px 20px rgba(0,0,0,0.15)'
              }}
            />
            <div style={{
              marginTop: '12px',
              color: '#636e72',
              fontFamily: 'Comic Sans MS, cursive, sans-serif',
              fontSize: '0.9rem'
            }}>
              🍿 Grab some popcorn and enjoy! 🍿
            </div>
          </div>
        )}

        {/* Story Content */}
        {material.type === "story" && (
          <div>
            <div style={{
              fontSize: '3rem',
              marginBottom: '20px',
              animation: 'bounce 1s ease-out'
            }}>
              📖
            </div>
            <Paragraph
              style={{
                whiteSpace: "pre-line",
                fontSize: "1.3rem",
                lineHeight: 1.8,
                color: "#2d3436",
                fontFamily: "Comic Sans MS, cursive, sans-serif",
                background: 'linear-gradient(135deg, #dfe6e9 0%, #b2bec3 100%)',
                padding: '20px',
                borderRadius: '16px',
                boxShadow: 'inset 0 2px 8px rgba(0,0,0,0.1)',
                border: '2px dashed #74b9ff'
              }}
            >
              {material.content}
            </Paragraph>
            <div style={{
              marginTop: '16px',
              color: '#636e72',
              fontFamily: 'Comic Sans MS, cursive, sans-serif',
              fontSize: '0.9rem'
            }}>
              📚 Happy reading, little scholar! 🌟
            </div>
          </div>
        )}

        {/* Link Content */}
        {material.type === "link" && (
          <div>
            <div style={{
              fontSize: '3rem',
              marginBottom: '20px',
              animation: 'spin 3s linear infinite'
            }}>
              🌍
            </div>
            <div style={{
              background: 'linear-gradient(135deg, #00cec9 0%, #55efc4 100%)',
              padding: '20px',
              borderRadius: '16px',
              marginBottom: '16px'
            }}>
              <div style={{
                fontSize: '1.4rem',
                color: 'white',
                fontFamily: 'Comic Sans MS, cursive, sans-serif',
                marginBottom: '12px',
                textShadow: '1px 1px 3px rgba(0,0,0,0.3)'
              }}>
                🚀 Ready for an adventure?
              </div>
              <a
                href={material.content}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  display: "inline-block",
                  fontSize: "1.2rem",
                  color: "white",
                  fontWeight: "bold",
                  textDecoration: 'none',
                  background: 'rgba(255,255,255,0.2)',
                  padding: '12px 24px',
                  borderRadius: '25px',
                  fontFamily: 'Comic Sans MS, cursive, sans-serif',
                  boxShadow: '0 4px 15px rgba(0,0,0,0.2)',
                  transition: 'transform 0.2s ease, box-shadow 0.2s ease'
                }}
                onMouseEnter={(e) => {
                  e.target.style.transform = 'scale(1.05)';
                  e.target.style.boxShadow = '0 6px 20px rgba(0,0,0,0.3)';
                }}
                onMouseLeave={(e) => {
                  e.target.style.transform = 'scale(1)';
                  e.target.style.boxShadow = '0 4px 15px rgba(0,0,0,0.2)';
                }}
              >
                🌐 Visit Cool Website! 🎉
              </a>
            </div>
            <div style={{
              color: '#636e72',
              fontFamily: 'Comic Sans MS, cursive, sans-serif',
              fontSize: '0.9rem'
            }}>
              🔍 Discover amazing things online! ✨
            </div>
          </div>
        )}
      </Card>

      {/* CSS Animations */}
      <style jsx>{`
        @keyframes bounce {
          0%, 20%, 53%, 80%, 100% {
            transform: translate3d(0,0,0);
          }
          40%, 43% {
            transform: translate3d(0,-30px,0);
          }
          70% {
            transform: translate3d(0,-15px,0);
          }
          90% {
            transform: translate3d(0,-4px,0);
          }
        }

        @keyframes pulse {
          0% {
            transform: scale(1);
          }
          50% {
            transform: scale(1.1);
          }
          100% {
            transform: scale(1);
          }
        }

        @keyframes spin {
          0% {
            transform: rotate(0deg);
          }
          100% {
            transform: rotate(360deg);
          }
        }

        .material-tag:hover {
          transform: scale(1.1) !important;
        }
      `}</style>
    </Modal>
  );
};

export default QuizMaterial;