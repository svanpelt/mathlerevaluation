
const symbols = ['-', '+', '/',  '*'];
const numbers = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '0']
const valid_entries = {
	0: ['1', '2', '3', '4', '5', '6', '7', '8', '9', '0'],
	1: ['1', '2', '3', '4', '5', '6', '7', '8', '9', '0', '-', '+', '/', '*',],
	2: ['1', '2', '3', '4', '5', '6', '7', '8', '9', '0', '-', '+', '/', '*', ],
	3: ['1', '2', '3', '4', '5', '6', '7', '8', '9', '0', '-', '+', '/', '*', ],
	4: ['1', '2', '3', '4', '5', '6', '7', '8', '9', '0', '-', '+', '/', '*', ],
	5: ['1', '2', '3', '4', '5', '6', '7', '8', '9', '0',],
};

create_valid_equations();

function create_valid_equations() {
	let results = [];
	nest_valid_symbols(0, results, "");
	
	let valid = {};
	results.forEach(eq => {
		let value = eval(eq.replace('^', '**'));
		if (value < 100 && value > -1 && Number.isInteger(value)) {
			if (valid[value] != null) {
				let newArray = valid[value];
				valid[value].push(eq);
			} else {
				valid[value] = [eq];
			}
		}
	});
	let counts = {};
	for (const [key, value] of Object.entries(valid)) {
		counts[key] = value.length;
	}


	console.log(JSON.stringify(counts));
}

function nest_valid_symbols(i, results, start) {
	if (i == 6) {
		results.push(start);
		return;
	}
	let next_valid_symbols = valid_entries[i];
	for (let j = 0; j< next_valid_symbols.length; j++) {
		let char = next_valid_symbols[j];
		if (is_valid_char(start, char)) {
			nest_valid_symbols(i + 1, results, start + char);
		}
	}

}

function is_valid_char(start, char) {
  if (char === '!' && symbols.includes(start.charAt(start.length - 1))) {
  	return false;
  }
  if (symbols.includes(char) && symbols.includes(start.charAt(start.length - 1))) {

  	return false;
  }

  if (numbers.includes(char)) {
  	if (number_is_0_prefixed(start + char)) {
  		return false;
  	}
  }
  return true;
}

function number_is_0_prefixed(eq) {
  let number = '';
  for(let i = 0; i < eq.length; i ++) {
  	let char = eq.charAt(i);
  	if (symbols.includes(char)) {
  		number = '';
  		continue;
  	}
  	number += char;
  	if (number.length > 1 && number.charAt(0) == '0') {
  		return true;
  	}
  }
  return false;
}


function filter_valid_constraints(valid, guesses, word, log = true) {
	if (log === true){
	  console.log("Checking guess quality for " + word + ", " + valid.length + " options");
	  // pick_bad_guess(valid, word);
	}
	let filtered_valid = valid;
	let remaining = [];
	for (guess of guesses) {
	  filtered_valid = filter_valid_constraints_single(filtered_valid, guess, word);
	if (log === true){
		console.log(guess + ": " + filtered_valid.length + " remaining words")
		console.log(filtered_valid);
		// bad_option = pick_bad_guess(filtered_valid, word);
	}
	remaining.push(filtered_valid.length);
	}
	return remaining
}

function filter_valid_constraints_single(valid, guess, word) {
	const constraints = constrain(guess, word)
	includes = constraints[0];
	excludes = constraints[1];
	includes_in_a_different_position = constraints[2];

	let filtered_valid = valid.filter(option => {
		//
		for (let i = 0; i < option.length; i++) {
			if (includes[i] != null && includes[i] !== option[i]) {
				return false;
			}
			if (includes_in_a_different_position[i] != null 
				&& includes_in_a_different_position[i] === option[i]) {
				return false;
			}
		}
		//excludes
		for (char of option) {
			if (excludes.includes(char)) {

				return false;
			}
		}
		// different position
		for (required of Object.values(includes_in_a_different_position)) {
			if (!option.includes(required)) {
				return false;
			}
		}

		return true;
	});
	return filtered_valid;
}

/*
 * This function creates constraints based upon a guess and the correct word. 
 * The three constraints are:
 ** Includes at a specific position (green letters)
 ** Excludes (black letters)
 ** Includes at a different position (yellow letters)
 * These constraints only work on a single word, and past constraints are discarded.
 * This should work because the valid wordlist should be filtered of all words that 
 * hit past constraints.
 */
function constrain(guess, word) {
	let filtered_word = word;
	let filtered_guess = guess;
	let includes_at_position = {};
	let excludes = [];
	let includes_in_a_different_position = {};
	for (let i = 0; i < guess.length; i++) {
		if (guess[i] === word[i]) {
			includes_at_position[i] = guess[i];
		} else if (!word.includes(guess[i])) {
			excludes.push(guess[i]);
		} else if (word.includes(guess[i]) && can_include_another_of_this_letter(guess[i], word, Object.values(includes_at_position), Object.values(includes_in_a_different_position))) {
			includes_in_a_different_position[i] = guess[i];
		}
	}
	return [includes_at_position, excludes, includes_in_a_different_position];
}

/* 
 * This function counts all the letters in the word, as well as the letters in existing
 * constraints. This allows us to filter doubled letters in guesses that should be yellow.
 * TODO: there is probably a better way to do this, all of this, what have I written?
 */
function can_include_another_of_this_letter(char, word, includes_values, different_values) {
	let counts_in_word = {};
	let counts_in_constraints = {};
	for (letter of word) {
		if (counts_in_word[letter] != null) {
			counts_in_word[letter] = counts_in_word[letter] + 1
		} else {
			counts_in_word[letter] = 1
		}
	}
	for (letter of includes_values) {
		if (counts_in_constraints[letter] != null) {
			counts_in_constraints[letter] = counts_in_constraints[letter] + 1
		} else {
			counts_in_constraints[letter] = 1
		}
	}
	for (letter of different_values) {
		if (counts_in_constraints[letter] != null) {
			counts_in_constraints[letter] = counts_in_constraints[letter] + 1
		} else {
			counts_in_constraints[letter] = 1
		}
	}
	if (counts_in_constraints[char] == null || counts_in_constraints[char] < counts_in_word[char]) {
		return true;
	} 
	return false;

}

