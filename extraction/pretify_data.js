const fs = require("fs");
const { v4: uuidv4 } = require("uuid");

fs.readFile("level2_extraction.json", "utf8", async function (err, data) {
  if (err) return console.log(err);
  var list = JSON.parse(data);
  // const type = new Set();
  // list.forEach(element => {
  //   if(element.Main_Muscle_Worked){
  //     type.add(element.Main_Muscle_Worked)
  //   }
  // });

  // console.log(type)
  list.forEach((exercise, i) => {
    exercise.video_src = exercise.extra.video_src;
    exercise.og_link = exercise.src;
    exercise.slug = uuidv4();
    exercise.exc_name = exercise.name;
    if (exercise.extra.ext_img) {
      exercise.ext_img = exercise.extra.ext_img;
    }
    if (exercise.extra.muscle_img)
      exercise.muscle_img = exercise.extra.muscle_img;
    if (exercise.extra.instructions)
      exercise.instructions = exercise.extra.instructions;
    if (exercise.extra.related_excercises)
      exercise.related_excercises = exercise.extra.related_excercises;
    if (exercise.extra.short_desc)
      exercise.short_desc = exercise.extra.short_desc;
    if (exercise.extra.benifits) exercise.benifits = exercise.extra.benifits;
    if (exercise.extra.stats) {
      exercise.extra.stats.map((h) => {
        if (typeof h === "string") {
          exercise.Level = h.split(":")[1].trim();
        } else {
          exercise[`${h[0].split(":")[0].replaceAll(" ", "_")}`] = h[0]
            .split(":")[1]
            .trim();
        }
      });
    }
    delete exercise.extra;
    delete exercise.src;
    delete exercise.name;
  });

  fs.writeFile("structured_data.json", JSON.stringify(list), async (err) => {
    if (err) {
      console.log(err);
    }
  });
});
