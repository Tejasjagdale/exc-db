import fs from "fs";
import fetch from "node-fetch";

fs.readFile("structured_data.json", "utf8", async function (err, data) {
  if (err) return console.log(err);
  var list = JSON.parse(data);
  var failed = [];

  function PostCode(data, index) {
    fetch("http://localhost:1337/api/exercises", {
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        Authorization: `Bearer f77a9853c7c48fae97068eee1042ceb49edb42b64f367399ae3bdc9378728143b44b128eb39b57201f151b72cbe1336f568a39b5680717fb528667ce30c788cb8c99c9ae16bbaad36e5317584412ca8125e840342750a4d4fa3ef2063646766557dd047d075a76e1faaf84063f54792ab839fb98a84f3d7f0bd43ba0112e34b3`,
      },
      method: "POST",
      body: JSON.stringify({ data: data }),
    })
      .then((res) => res.json())
      .then((data1) => {
        if (data1.error) {
          failed.push(data);
        }
        if (index === list.length - 1) {
          fs.writeFile(
            "failed_run2.json",
            JSON.stringify(failed),
            async (err) => {
              if (err) {
                console.log(err);
              }
            }
          );
        }
      })
      .catch((err) => {
        console.log(err);
        if (index === list.length - 1) {
          fs.writeFile(
            "failed_run2.json",
            JSON.stringify(failed),
            async (err) => {
              if (err) {
                console.log(err);
              }
            }
          );
        }
      });
  }

  list.map((exercise, index) => {
    PostCode(exercise, index);
  });
});
