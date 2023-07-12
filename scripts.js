var request = new XMLHttpRequest();

// Could change this to a simple include .js file with word_list as array
request.open('GET', '/stripped_wordlist.txt', true);


request.onreadystatechange = function () {
    if (request.readyState === 4) {

        const letterRegex = /^[a-z]||Backspace$/i;
        const JSONlist = request.responseText;
        const wordListArray = JSON.parse(JSONlist);
        const keyboardMarker = document.querySelector(".keyboard_marker");
        const randomIndex = Math.floor(Math.random() * wordListArray.length);
        const wordToGuess = wordListArray[randomIndex];
        const wordGrid = document.querySelector(".grid");
        keyboardMarker.addEventListener("click", handleClick);

        
        let guessedWord = [];
        let currentLetterPosition = 1;
        let amountOfGuesses = 1;


        console.log(wordToGuess);

        function handleClick(event) {
            if (event.target.id.startsWith("Del")) {
                keyPressed({ key: "Backspace" }, false);
            } else if (event.target.id.startsWith("Enter")) {
                keyPressed({ key: "Enter" });
            } else {
                keyPressed({ key: event.target.id[0] }, true)
            }

        }


        document.addEventListener("keyup", keyPressed);

        function keyPressed(event, referred = false) {
            if (event.ctrlKey || event.altKey) return;

            if (!letterRegex.test(event.key)) return;
            // Not allowing words with duplicate letters.. yet?
            if (guessedWord.includes(event.key)) return;

            const currentTile = document.querySelector(".letterBox:not(.guessed)");
            const currentRow = document.querySelector(`#row${amountOfGuesses}`);


            // Doesnt need to check for other keys if sent via visual keyboard
            if (!referred) {
                if (event.key.length > 1) {
                    if (event.key === "Backspace") {

                        deleteLastLetter();
                        return;

                    } else if (event.key === "Enter") {

                        submitGuess();
                        return;

                    } else {
                        return;
                    }
                }
            }

            // Handle letter tiles
            if (currentLetterPosition < 6) {
                const currentKey = keyboardMarker.querySelector(`#${event.key}_key`);
                currentTile.textContent = event.key.toUpperCase();
                guessedWord.push(event.key);
                currentTile.classList.add("guessed");
                currentKey.classList.add("guessed");
                currentLetterPosition++;

            }

            function submitGuess() {

                if (currentLetterPosition > 5) {

                    if (guessedWord.join("") === wordToGuess) {
                        // Word is correct
                        console.log("You win!");
                        const letterBoxes = currentRow.querySelectorAll(".letterBox");
                        letterBoxes.forEach(letterBox => letterBox.classList.add("correct"));
                        endGame(true);
                        showPopup(true);

                    } else if (wordListArray.includes(guessedWord.join(""))) {

                        amountOfGuesses++;
                        // Check letters and reset guess

                        guessedWord.map((value, index) => {

                            const currentTile = currentRow.querySelector(`[data-id="${index}"]`)
                            const currentKey = keyboardMarker.querySelector(`#${value}_key`);

                            if (wordToGuess.includes(value)) {

                                // In correct place? 
                                if (wordToGuess.indexOf(value) === index) {

                                    currentTile.classList.add("correct");
                                    currentTile.classList.add("flip");
                                    // Check key is already set the class
                                    if (!currentKey.classList.contains("correct")) {

                                        currentKey.classList.add("correct");

                                    }
                                } else {

                                    currentTile.classList.add("wrong_place");
                                    currentTile.classList.add("flip");
                                    if (!currentKey.classList.contains("wrong_place")) {

                                        currentKey.classList.add("wrong_place");
                                    }
                                }
                            } else {

                                currentTile.classList.add("wrong");
                                currentTile.classList.add("flip");
                                if (!currentKey.classList.contains("wrong")) {

                                    currentKey.classList.add("wrong");
                                }
                            }

                        });


                        currentLetterPosition = 1;
                        guessedWord = [];
                        if (amountOfGuesses > 6) {

                            // NO MORE GUESSES
                            endGame();
                            showPopup();
                        }

                    } else {

                        currentRow.classList.add("shake-horizontal");
                        window.setTimeout(() => {
                            currentRow.classList.remove("shake-horizontal");
                        }, 600);

                        console.log("Not a valid word");
                    }

                }
            }

            function showPopup(didWin = false) {
                const popup = document.querySelector(".popup");

                popup.classList.add("show");

                const popupHeader = document.querySelector(".popup_header");
                const innerPopUp = popup.querySelector(".inner_popup");
                const popupLetterGrid = document.querySelector(".correctWord");
                const popupGameInfo = document.querySelector(".game_info");
                const stateCorrectWord = document.querySelector(".word_was");


                if (didWin) {
                    innerPopUp.classList.add("winner");
                    popupHeader.textContent = "Hooray!";
                    wordToGuess.split("").map((element, index) => {
                        let currentLetterBox = popupLetterGrid.querySelector(`#\\3${index} `);
                        currentLetterBox.textContent = element.toUpperCase();
                        currentLetterBox.classList.add("correct");
                        popupGameInfo.textContent = `You guessed the word in ${amountOfGuesses} ${(amountOfGuesses > 1) ? "attempts" : "attempt"}`
                    })

                } else {
                    innerPopUp.classList.add("loser");
                    popupHeader.textContent = "Uh oh!";
                    stateCorrectWord.textContent = "The word was:"
                    wordToGuess.split("").map((element, index) => {
                        let currentLetterBox = popupLetterGrid.querySelector(`#\\3${index} `);
                        currentLetterBox.textContent = element.toUpperCase();
                        currentLetterBox.classList.add("correct");
                        popupGameInfo.textContent = "Better luck next time!";});
                }
            }

            function endGame() {
                document.removeEventListener("keyup", keyPressed);
            }

            function deleteLastLetter() {
                let currentRow = document.querySelector(`#row${amountOfGuesses}`);
                let guessedElements = currentRow.querySelectorAll(".guessed")
                if (guessedElements.length) {

                    let lastGuessElement = guessedElements[guessedElements.length - 1]
                    let lastKey = keyboardMarker.querySelector(`#${lastGuessElement.textContent.toLowerCase()}_key`);

                    lastKey.classList.remove("guessed");

                    lastGuessElement.classList.remove("guessed");
                    lastGuessElement.textContent = "";

                    guessedWord.pop();
                    currentLetterPosition--;
                }

            }
        }
    }
}

request.send();