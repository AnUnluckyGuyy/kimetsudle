let characters = [];
let answer = null;

const guessedCharacters = new Set();

const ARC_ORDER = {
"final selection": 1,
"kidnapper's bog": 2,
"asakusa": 3,
"tsuzumi mansion": 4,
"mount natagumo": 5,
"rehabilitation training": 6,
"mugen train": 7,
"entertainment district": 8,
"swordsmith village": 9,
"infinity castle": 10
};

const input = document.getElementById("guessInput");
const button = document.getElementById("guessBtn");
const autocomplete = document.getElementById("autocomplete");
const resultsBody = document.getElementById("resultsBody");
const winBanner = document.getElementById("winBanner");

async function loadCharacters() {


try {

    const response = await fetch("demonslayer.csv");

    if (!response.ok) {
        throw new Error(`Failed to load CSV (${response.status})`);
    }

    const csv = await response.text();

    characters = parseCSV(csv);

    answer =
        characters[
            Math.floor(Math.random() * characters.length)
        ];

    console.log("Characters loaded:", characters.length);
    console.log("Answer:", answer);

} catch (err) {

    console.error(err);
}


}

function parseCSV(csv) {


const lines = csv
    .trim()
    .split(/\r?\n/);

const headers = lines[0]
    .split(",")
    .map(h =>
        h
            .trim()
            .replace(/^\uFEFF/, "")
            .toLowerCase()
    );

return lines
    .slice(1)
    .map(line => {

        const values =
            line
                .split(",")
                .map(v => v.trim());

        const obj = {};

        headers.forEach((header, index) => {
            obj[header] = values[index] || "";
        });

        return obj;
    })
    .filter(character => character.name);


}

input.addEventListener("input", () => {


const value =
    input.value.toLowerCase().trim();

autocomplete.innerHTML = "";

if (!value) return;

const matches =
    characters.filter(character =>
        character.name &&
        character.name.includes(value)
    );

matches
    .slice(0, 5)
    .forEach(character => {

        const item =
            document.createElement("div");

        item.classList.add(
            "autocomplete-item"
        );

        item.textContent =
            titleCase(character.name);

        item.addEventListener("click", () => {

            input.value =
                character.name;

            autocomplete.innerHTML = "";
        });

        autocomplete.appendChild(item);
    });


});

button.addEventListener(
"click",
submitGuess
);

input.addEventListener("keydown", e => {


if (e.key !== "Enter") return;

e.preventDefault();

const firstSuggestion =
    autocomplete.querySelector(
        ".autocomplete-item"
    );

if (firstSuggestion) {

    input.value =
        firstSuggestion.textContent
            .toLowerCase();
}

submitGuess();


});

function submitGuess() {


const name =
    input.value
        .toLowerCase()
        .trim();

const guess =
    characters.find(
        c =>
            c.name &&
            c.name.toLowerCase() === name
    );

if (!guess) {
    return;
}

if (
    guessedCharacters.has(
        guess.name
    )
) {
    return;
}

guessedCharacters.add(
    guess.name
);

addGuessRow(
    guess,
    answer
);

autocomplete.innerHTML = "";
input.value = "";

if (
    guess.name === answer.name
) {

    if (winBanner) {
        winBanner.classList.add(
            "show"
        );
    }

    input.disabled = true;
    button.disabled = true;
}

}

function compareExact(
guess,
answer
) {

return guess === answer
    ? "correct"
    : "wrong";


}

function compareNumberClass(
guess,
answer
) {

const g =
    parseInt(guess);

const a =
    parseInt(answer);

if (
    Number.isNaN(g) ||
    Number.isNaN(a)
) {
    return "";
}

if (g === a) {
    return "correct";
}

return g < a
    ? "higher"
    : "lower";

}

function compareNumberText(
guess,
answer
) {

const g =
    parseInt(guess);

const a =
    parseInt(answer);

if (
    Number.isNaN(g) ||
    Number.isNaN(a)
) {
    return guess;
}

if (g === a) {
    return guess;
}

return g < a
    ? `${guess} ⬆️`
    : `${guess} ⬇️`;


}

function compareArcClass(
guessArc,
answerArc
) {


const g =
    ARC_ORDER[
        guessArc.toLowerCase()
    ];

const a =
    ARC_ORDER[
        answerArc.toLowerCase()
    ];

if (g === a) {
    return "correct";
}

return g < a
    ? "higher"
    : "lower";

}

function compareArcText(
guessArc,
answerArc
) {

const g =
    ARC_ORDER[
        guessArc.toLowerCase()
    ];

const a =
    ARC_ORDER[
        answerArc.toLowerCase()
    ];

if (g === a) {
    return titleCase(
        guessArc
    );
}

return g < a
    ? `${titleCase(guessArc)} ⬆️`
    : `${titleCase(guessArc)} ⬇️`;

}

function addGuessRow(
guess,
answer
) {

const row =
    document.createElement("tr");

row.innerHTML = `
    <td class="${compareExact(guess.name, answer.name)}">
        ${titleCase(guess.name)}
    </td>

    <td class="${compareExact(guess.gender, answer.gender)}">
        ${titleCase(guess.gender)}
    </td>

    <td class="${compareExact(guess.race, answer.race)}">
        ${titleCase(guess.race)}
    </td>

    <td class="${compareNumberClass(
        guess.age,
        answer.age
    )}">
        ${compareNumberText(
            guess.age,
            answer.age
        )}
    </td>

    <td class="${compareExact(
        guess["hair color"],
        answer["hair color"]
    )}">
        ${titleCase(
            guess["hair color"]
        )}
    </td>

    <td class="${compareNumberClass(
        guess.height,
        answer.height
    )}">
        ${compareNumberText(
            guess.height,
            answer.height
        )}
    </td>

    <td class="${compareExact(
        guess["combat style"],
        answer["combat style"]
    )}">
        ${titleCase(
            guess["combat style"]
        )}
    </td>

    <td class="${compareExact(
        guess.affiliation,
        answer.affiliation
    )}">
        ${titleCase(
            guess.affiliation
        )}
    </td>

    <td class="${compareArcClass(
        guess["first arc"],
        answer["first arc"]
    )}">
        ${compareArcText(
            guess["first arc"],
            answer["first arc"]
        )}
    </td>
`;

resultsBody.prepend(row);

}

function titleCase(str) {

if (!str) return "";

return str.replace(
    /\b\w/g,
    char =>
        char.toUpperCase()
);

}

loadCharacters();