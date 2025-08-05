/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("_pb_users_auth_")

  // remove field
  collection.fields.removeById("relation2812878347")

  // add field
  collection.fields.addAt(9, new Field({
    "hidden": false,
    "id": "select2812878347",
    "maxSelect": 1,
    "name": "domain",
    "presentable": false,
    "required": false,
    "system": false,
    "type": "select",
    "values": [
      "webD",
      "cW",
      "gD",
      "vE"
    ]
  }))

  return app.save(collection)
}, (app) => {
  const collection = app.findCollectionByNameOrId("_pb_users_auth_")

  // add field
  collection.fields.addAt(8, new Field({
    "cascadeDelete": false,
    "collectionId": "pbc_489209975",
    "hidden": false,
    "id": "relation2812878347",
    "maxSelect": 1,
    "minSelect": 0,
    "name": "domain",
    "presentable": false,
    "required": false,
    "system": false,
    "type": "relation"
  }))

  // remove field
  collection.fields.removeById("select2812878347")

  return app.save(collection)
})
