import cv2
import numpy as np
from insightface.model_zoo import get_model
from connect import db_connection

recognition_model = get_model(
    r"D:\Projects\EduSync\models\w600k_mbf.onnx"
)

recognition_model.prepare(
    ctx_id=0
)


def generate_embeddings(enrollment_no):

    conn = db_connection()
    cursor = conn.cursor()

    try:

        cursor.execute("""
            SELECT
                id,
                face_image
            FROM student_face
            WHERE enrollment_no=%s
        """, (enrollment_no,))

        faces = cursor.fetchall()

        for row in faces:

            img_array = np.frombuffer(
                row["face_image"],
                np.uint8
            )

            img = cv2.imdecode(
                img_array,
                cv2.IMREAD_COLOR
            )

            img = cv2.resize(
                img,
                (112, 112)
            )

            embedding = recognition_model.get_feat(
                img
            )

            embedding_bytes = embedding.astype(
                np.float32
            ).tobytes()

            cursor.execute("""
                UPDATE student_face
                SET
                    face_embedding=%s,
                    embedding_status='SUCCESS'
                WHERE id=%s
            """, (
                embedding_bytes,
                row["id"]
            ))

        conn.commit()

    except Exception as e:

        print(
            "Embedding Error:",
            str(e)
        )

        cursor.execute("""
            DELETE FROM student_face
            WHERE enrollment_no=%s
        """, (
            enrollment_no,
        ))

        conn.commit()

    finally:

        cursor.close()
        conn.close()