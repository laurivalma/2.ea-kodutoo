var night;
var TYPER = function(){

	//singleton
    if (TYPER.instance_) {
        return TYPER.instance_;
    }
    TYPER.instance_ = this;

	// Muutujad
	this.WIDTH = window.innerWidth;
	this.HEIGHT = window.innerHeight;
	this.canvas = null;
	this.ctx = null;

	this.words = []; // kõik sõnad
	this.word = null; // preagu arvamisel olev sõna
	this.word_min_length = 3;
	this.guessed_words = 0; // arvatud sõnade arv


	//mängija objekt, hoiame nime ja skoori
	this.player = {name: null, score: 0, mistakes: 0};

	this.init();
};

var timeRemaining;

TYPER.prototype = {

	// Funktsioon, mille käivitame alguses
	init: function(){

		// Lisame canvas elemendi ja contexti
		this.canvas = document.getElementsByTagName('canvas')[0];
		this.ctx = this.canvas.getContext('2d');

		// canvase laius ja kõrgus veebisirvija akna suuruseks (nii style, kui reso)
		this.canvas.style.width = this.WIDTH + 'px';
		this.canvas.style.height = this.HEIGHT + 'px';

		//resolutsioon
		// kui retina ekraan, siis võib ja peaks olema 2 korda suurem
		this.canvas.width = this.WIDTH;
		this.canvas.height = this.HEIGHT;

		// laeme sõnad
		this.loadWords();
	},

	loadPlayerData: function(){

		// küsime mängija nime ja muudame objektis nime
		var p_name = prompt("Sisesta mängija nimi");

		// Kui ei kirjutanud nime või jättis tühjaks
		if(p_name === null || p_name === ""){
			p_name = "Tundmatu";

		}

		// Mänigja objektis muudame nime
		this.player.name = p_name; // player =>>> {name:"Romil", score: 0}
        console.log(this.player);
	},

	loadWords: function(){

        console.log('loading...');

		// AJAX http://www.w3schools.com/ajax/tryit.asp?filename=tryajax_first
		var xmlhttp = new XMLHttpRequest();

		// määran mis juhtub, kui saab vastuse
		xmlhttp.onreadystatechange = function(){

			//console.log(xmlhttp.readyState); //võib teoorias kõiki staatuseid eraldi käsitleda

			// Sai faili tervenisti kätte
			if(xmlhttp.readyState == 4 && xmlhttp.status == 200){

                console.log('successfully loaded');

				// serveri vastuse sisu
				var response = xmlhttp.responseText;
				//console.log(response);

				// tekitame massiivi, faili sisu aluseks, uue sõna algust märgib reavahetuse \n
				var words_from_file = response.split('\n');
				//console.log(words_from_file);

                // Kuna this viitab siin xmlhttp päringule siis tuleb läheneda läbi avaliku muutuja
                // ehk this.words asemel tuleb kasutada typerGame.words

				//asendan massiivi
				typerGame.words = structureArrayByWordLength(words_from_file);
				console.log(typerGame.words);

				// küsime mängija andmed
                typerGame.loadPlayerData();

				// kõik sõnad olemas, alustame mänguga
				typerGame.start();
			}
		};

		xmlhttp.open('GET','./lemmad2013.txt',true);
		xmlhttp.send();
	},

	start: function(){

		// Tekitame sõna objekti Word
		this.generateWord();
		//console.log(this.word);

    timeRemaining = 60;
    showTime= document.querySelector('#time');
    timer(timeRemaining, showTime);
        //joonista sõna
		this.word.Draw();

		// Kuulame klahvivajutusi
		window.addEventListener('keypress', this.keyPressed.bind(this));

	},

    generateWord: function(){

        // kui pikk peab sõna tulema, + min pikkus + äraarvatud sõnade arvul jääk 5 jagamisel
        // iga viie sõna tagant suureneb sõna pikkus ühe võrra
        var generated_word_length =  this.word_min_length + parseInt(this.guessed_words/2);
        level = generated_word_length - 2;
        console.log(level);


    	// Saan suvalise arvu vahemikus 0 - (massiivi pikkus -1)
    	var random_index = (Math.random()*(this.words[generated_word_length].length-1)).toFixed();

        // random sõna, mille salvestame siia algseks
    	var word = this.words[generated_word_length][random_index];

    	// Word on defineeritud eraldi Word.js failis
        this.word = new Word(word, this.canvas, this.ctx);
    },

	keyPressed: function(event){

		//console.log(event);
		// event.which annab koodi ja fromcharcode tagastab tähe
		var letter = String.fromCharCode(event.which);
		//console.log(letter);

		// Võrdlen kas meie kirjutatud täht on sama mis järele jäänud sõna esimene
		//console.log(this.word);
		if(letter === this.word.left.charAt(0)){

			// Võtame ühe tähe maha
			this.word.removeFirstLetter();
      this.player.score +=1;
      flashGreen();
      //console.log(this.player.score);
      document.getElementById('score').innerHTML = "SCORE: " + this.player.score;

			// kas sõna sai otsa, kui jah - loosite uue sõna

			if(this.word.left.length === 0){

				this.guessed_words += 1;
        document.getElementById('level').innerHTML = "ÕIGEID SÕNU: " + this.guessed_words;

                //update player score
              //  this.player.score = this.guessed_words;

				//loosin uue sõna
				this.generateWord();
			}

			//joonistan uuesti
			this.word.Draw();
		}else{ //VALE VAJUTUS
      console.log("vale");
		  this.player.score -=0.5;
      this.player.mistakes +=1;
      console.log(this.player.mistakes);
      flashRed();
      document.getElementById('score').innerHTML = "SKOOR: " + this.player.score;
      document.getElementById('mistakes').innerHTML = "VIGU: " + this.player.mistakes;
		}

	} // keypress end

};


/* HELPERS */
function structureArrayByWordLength(words){
    // TEEN massiivi ümber, et oleksid jaotatud pikkuse järgi
    // NT this.words[3] on kõik kolmetähelised

    // defineerin ajutise massiivi, kus kõik on õiges jrk
    var temp_array = [];

    // Käime läbi kõik sõnad
    for(var i = 0; i < words.length; i++){

        var word_length = words[i].length;

        // Kui pole veel seda array'd olemas, tegu esimese just selle pikkusega sõnaga
        if(temp_array[word_length] === undefined){
            // Teen uue
            temp_array[word_length] = [];
        }

        // Lisan sõna juurde
        temp_array[word_length].push(words[i]);
    }

    return temp_array;
}




window.onload = function(){
	var typerGame = new TYPER();
	window.typerGame = typerGame;
};

var r;

function timer(timeRemaining, showTime) {
  var timer = timeRemaining, seconds;
    r = setInterval(function() {

    seconds = parseInt(timer % 60, 10);
    seconds = seconds < 10 ? + seconds : seconds;

    showTime.textContent = seconds;

    if (--timer < 0) {
      var session = [];

      var game = {
        id: parseInt(1000 + Math.random() * 999),
        name: typerGame.player.name,
        score: typerGame.player.score,
        mistakes: typerGame.player.mistakes,
        level: typerGame.guessed_words
      };
      var gamesFromStorage = null;

      if (localStorage.getItem("session")) {
        gamesFromStorage = JSON.parse(localStorage.getItem("session"));
        console.log(gamesFromStorage);

        if (gamesFromStorage) {
          session = gamesFromStorage;
        }

      }

      session.push(game);

      localStorage.setItem("session", JSON.stringify(session));


      var replay = confirm("Aeg sai otsa. Sinu skoor: " + typerGame.player.score + " Mängi uuesti?");
      if (replay === true) {
        clearInterval(r);
        timer = timeRemaining;
        location.reload(typerGame.start);
      } else {
        window.location.href = "index.html";
      }

    }
    //console.log("timer");
  }, 1000);
}



function nightMode() {
  if (night === 1) {
    document.body.style.backgroundColor = "white";
    document.body.style.color = "black";
    night = 0;
  } else {
    document.body.style.backgroundColor = "rgb(75, 75, 75)";
    document.body.style.color = "green";
    night = 1;
  }
}

function flashGreen() {
  document.body.style.backgroundColor = "green";
  setTimeout(flashBack, 100);
}

function flashRed() {
  document.body.style.backgroundColor = "red";
  setTimeout(flashBack, 100);
}

function flashBack() {
  if (night === 1) {
    document.body.style.backgroundColor = "rgb(75, 75, 75)";
  }else {
    document.body.style.backgroundColor = "white";
  }
}
