def slice_image_with_overlap(
    image,
    tile_size=512,
    overlap=256
):

    width, height = image.size

    step = tile_size - overlap

    tiles = []

    for y in range(0, height, step):
        for x in range(0, width, step):

            x_end = min(x + tile_size, width)
            y_end = min(y + tile_size, height)

            tile = image.crop(
                (
                    x,
                    y,
                    x_end,
                    y_end
                )
            )

            tiles.append({
                "tile": tile,
                "x_offset": x,
                "y_offset": y
            })

    print(
        f"Generated {len(tiles)} tiles"
    )

    return tiles