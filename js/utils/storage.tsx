export function storageLinkBuilder(folder, Id, bust = 0) {
    return `https://firebasestorage.googleapis.com/v0/b/tieks-50780.appspot.com/o/${folder}%2F${Id}?alt=media&bust=${bust}`
}