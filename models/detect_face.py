from scrfd import SCRFD, Threshold
from PIL import Image
from io import BytesIO
from models.image_slicer import slice_image_with_overlap
from models.duplicate_remover import remove_duplicate_faces

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

def detect_faces_from_tiles(image):

    tiles = slice_image_with_overlap(
        image=image,
        tile_size=512,
        overlap=256
    )

    detections = []

    for tile_info in tiles:

        tile = tile_info["tile"]

        faces = detector.detect(
            tile,
            threshold=threshold
        )

        for face in faces:

            try:

                x1 = int(
                    face.bbox.upper_left.x +
                    tile_info["x_offset"]
                )

                y1 = int(
                    face.bbox.upper_left.y +
                    tile_info["y_offset"]
                )

                x2 = int(
                    face.bbox.lower_right.x +
                    tile_info["x_offset"]
                )

                y2 = int(
                    face.bbox.lower_right.y +
                    tile_info["y_offset"]
                )

                detections.append({
                    "bbox": (
                        x1,
                        y1,
                        x2,
                        y2
                    )
                })

            except Exception as e:

                print(
                    "Face Detection Error:",
                    e
                )

    print(
        "Faces Before Duplicate Removal:",
        len(detections)
    )

    detections = remove_duplicate_faces(
        detections,
        iou_threshold=0.4
    )

    print(
        "Faces After Duplicate Removal:",
        len(detections)
    )

    return detections