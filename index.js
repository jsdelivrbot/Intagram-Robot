const express = require('express')
const path = require('path')
const PORT = process.env.PORT || 5000
const ejs=require('ejs');
const bodyParser = require('body-parser');


const urlencodedParser = bodyParser.urlencoded({ extended: false })

express()
  .use(express.static(path.join(__dirname, 'public')))
  .engine('html',ejs.__express)
  .set('views', path.join(__dirname, 'views'))
  .set('view engine', 'html')
  .get('/', (req, res) => res.render('view'))
  .post('/process_post', urlencodedParser, function (req, res) {

   var option=req.body.select;
   var username=req.body.user_id;
   var password=req.body.password;
   var tags=req.body.tags.split(',') ;//= ['followforfollowback', 'pizza'];
   var specificAccounts=req.body.accounts.split(',');
   var randomFollowAndLikes=(option=='random_follow');
   var specificFollowAndLikes=(option=='specific_follow');

   const Nightmare = require('nightmare');
   var vo = require('vo');

   vo(run)(function(err, result) {
    if (err) throw err;

   });



   function *run() {
    const nightmare = Nightmare({
      openDevTools: {
        mode: 'detach'
      },
      show: true
    });

    // Logs In
    yield nightmare
      .goto('https://instagram.com/accounts/login')
      .wait(3000)
      .type('input[name="username"]', username)
      .type('input[name="password"]', password)
      .click('._5f5mN')
      .wait(3000);

    // For Debugging
   // const testing = {
  //    randomFollowAndLikes : true,
  //    specificFollowAndLikes : true
  //  }

    // Follows and Likes by Tags

    if (randomFollowAndLikes){
      for (let i = 0; i < tags.length; i++) {
        let accounts = yield nightmare
          .goto(`https://instagram.com/explore/tags/${tags[i]}`)
          .wait(15000)
          .evaluate(() => {
            const arr = [];
            const query = document.querySelectorAll('.v1Nh3 > a');
            for(let i = 0; i < query.length; i++){
              arr.push(query[i].href);
            }
            return arr;
          }
          );

        console.log(accounts);

        for(let j = 0; j < 10; j++){
          console.log(accounts[j]);
          yield nightmare
            .goto(accounts[j])
            .wait(3000)
            .click('.oW_lN')
            .wait(3000)
            .click('.coreSpriteHeartOpen')
            .wait(3000)
        }
      }
    }

    // Follows Specific Ppl and Likes Their First Photo

    if(specificFollowAndLikes){
      for(let i = 0; i < specificAccounts.length; i++){
        yield nightmare
          .goto('https://www.instagram.com/explore/')
          .type('input.XTCLo', specificAccounts[i])
          .wait(3000)
          .click('.yCE8d')
          .wait(10000)
          .click('button._5f5mN')
          .wait(3000)
          .click('.v1Nh3 > a')
          .wait(3000)
          .click('.coreSpriteHeartOpen')
          .wait(3000)
      }
    }

    yield nightmare.end()
   }
  //console.log(specificAccounts);
   //res.end(JSON.stringify(specificAccounts));
})
  .listen(PORT, () => console.log(`Listening on ${ PORT }`))
