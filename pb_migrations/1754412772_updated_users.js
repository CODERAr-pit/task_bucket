/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("_pb_users_auth_")

  // update field
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
      "cW",
      "gD",
      "vE",
      "Web Development"
    ]
  }))

  return app.save(collection)
}, (app) => {
  const collection = app.findCollectionByNameOrId("_pb_users_auth_")

  // update field
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
})
