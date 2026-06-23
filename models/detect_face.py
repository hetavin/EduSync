from scrfd import SCRFD, Threshold
from PIL import Image
from io import BytesIO

detector = SCRFD.from_path(
    r"D:\Projects\EduSync\models\scrfd_2.5g_bnkps.onnx"
)

threshold = Threshold(probability=0.4)


def extract_faces(file_stream):

    image = Image.open(file_stream).convert("RGB")

    faces = detector.detect(
        image,
        threshold=threshold
    )

    face_images = []

    for face in faces:

        try:

            x1 = int(face.bbox.upper_left.x)
            y1 = int(face.bbox.upper_left.y)

            x2 = int(face.bbox.lower_right.x)
            y2 = int(face.bbox.lower_right.y)

            cropped_face = image.crop(
                (x1, y1, x2, y2)
            )

            buffer = BytesIO()

            cropped_face.save(
                buffer,
                format="JPEG"
            )

            face_images.append(
                buffer.getvalue()
            )

        except Exception as e:

            print(
                "Face Crop Error:",
                e
            )

    print(
        "Faces Extracted:",
        len(face_images)
    )

    return face_images