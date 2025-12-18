// Map mouse coordinates from the browser window into the SVG coordinate system
document.addEventListener('DOMContentLoaded', () => {
	const svg = document.getElementById('interactive-arrow');
	const coordX = document.querySelector('#coordinate_x');
	const coordY = document.querySelector('#coordinate_y');
	const yearP = document.querySelector('#year');
	const inputYear = document.getElementById('input-year');
	const magnitudeSelect = document.getElementById('magnitude-select');
	var yearValue = parseFloat(inputYear.value);
	var magnitudeValue = parseFloat(magnitudeSelect.value);


	if (!svg || !coordX || !coordY) return;

	function updateCoords(evt) {
		// Use an SVGPoint (DOMPoint) and transform it by the inverse of the SVG's CTM
		const pt = svg.createSVGPoint();
		pt.x = evt.clientX;
		pt.y = evt.clientY;

		const ctm = svg.getScreenCTM();
		if (!ctm) return;

		const svgP = pt.matrixTransform(ctm.inverse());

		// Round values for display but keep actual values if needed
		coordX.textContent = `X: ${Math.round(svgP.x)}`;
		coordY.textContent = `Y: ${Math.round(svgP.y)}`;
		current_year = convert_x_to_years(svgP.x, yearValue * magnitudeValue);
		yearP.textContent = `${Math.round(current_year / magnitudeValue * 10) / 10} ${convert_magnitue_to_text(magnitudeValue)} Years ago`;
		const event = new CustomEvent('yearChanged', { 
        	detail: { current_year: current_year } 
    	});
    	window.dispatchEvent(event);
	}

	// Track pointer movement over the SVG. Use pointer events so touch also works.
	svg.addEventListener('pointermove', updateCoords);

	// Optionally clear or keep last coords when pointer leaves
	svg.addEventListener('pointerleave', () => {
		// leave as-is, or uncomment next two lines to reset to zeros
		// coordX.textContent = 'X: 0';
		// coordY.textContent = 'Y: 0';
	});

	inputYear.addEventListener('input', () => {
		console.log("input changed");
		yearValue = parseFloat(inputYear.value);
		magnitudeValue = parseFloat(magnitudeSelect.value);
		const event = new CustomEvent('magnitudeChanged', {
			detail: { first_year: yearValue, magnitude: magnitudeValue }
		});
		window.dispatchEvent(event);

	});
	magnitudeSelect.addEventListener('change', () => {
		yearValue = parseFloat(inputYear.value);
		magnitudeValue = parseFloat(magnitudeSelect.value);
		const event = new CustomEvent('magnitudeChanged', {
			detail: { first_year: yearValue, magnitude: magnitudeValue }
		});
		window.dispatchEvent(event);
	});

	function convert_x_to_years(x_cord, first_date) {
	return (1000 - x_cord) / 1000 * first_date
	};

	function convert_magnitue_to_text(magnitude) {
		if (magnitude === 1e9) return "Billions";
		if (magnitude === 1e6) return "Millions";
		if (magnitude === 1e3) return "Thousands";
		return "";
	}
});



