
const symbols = ['-', '+', '/', '*'];
const zero_preceder = ['1', '2', '3', '4', '5', '6', '7', '8', '9']
const valid_entries = {
	0: ['1', '2', '3', '4', '5', '6', '7', '8', '9', '0'],
	1: ['1', '2', '3', '4', '5', '6', '7', '8', '9', '0', '-', '+', '/', '*'],
	2: ['1', '2', '3', '4', '5', '6', '7', '8', '9', '0', '-', '+', '/', '*'],
	3: ['1', '2', '3', '4', '5', '6', '7', '8', '9', '0', '-', '+', '/', '*'],
	4: ['1', '2', '3', '4', '5', '6', '7', '8', '9', '0', '-', '+', '/', '*'],
	5: ['1', '2', '3', '4', '5', '6', '7', '8', '9', '0'],
};

create_valid_equations();

function create_valid_equations() {
	let results = [];
	nest_valid_symbols(0, results, "");
	let evals = results.map(eq => eval(eq));
	let counts = {};
	evals.forEach(value => {
		if (value < 100 && value > -1 && Number.isInteger(value)) {
			counts[value] = counts[value] != null ? counts[value] + 1 : 1;
		}
	});
	console.log(JSON.stringify(counts));
}

function nest_valid_symbols(i, results, start) {
	if (i == 6) {
		results.push(start);
		return;
	}
	let next_valid_symbols = valid_entries[i];
	for (let j = 0; j< next_valid_symbols.length; j++) {
		if ((!symbols.includes(next_valid_symbols[j]) || !symbols.includes(start.charAt(start.length - 1))) 
			&& 
			(next_valid_symbols[j] != 0 || 
			 zero_preceder.includes(start.charAt(start.length-1)))) {
			nest_valid_symbols(i + 1, results, start + next_valid_symbols[j]);
		}
	}

}

function evaluate(string) {

}
