// =====================================================
// GENERATEUR DE COULEUR. Permet de générer
// aléatoirement des couleurs correspondant à une
// palette de couleur choisie.
// =====================================================

var ColorsEnum = Object.freeze({"bright":1, "pastel":2, "dark":3, "light":4, "red":5, "green":6, "blue":7, "warm":8, "cold":9, "grey":10});

class ColorGenerator
{

	// =================================================
	// https://gist.github.com/mjackson/5311256
	static rgbToHsl(r, g, b) {
		var max = Math.max(r, g, b), min = Math.min(r, g, b);
		var h, s, l = (max + min) / 2;

		if (max == min) {
			h = s = 0; // achromatic
		} else {
			var d = max - min;
			s = l > 0.5 ? d / (2 - max - min) : d / (max + min);

			switch (max) {
				case r: h = (g - b) / d + (g < b ? 6 : 0); break;
				case g: h = (b - r) / d + 2; break;
				case b: h = (r - g) / d + 4; break;
			}

			h /= 6;
		}
		return [ h, s, l ];
	}

	// =================================================
	// https://gist.github.com/mjackson/5311256
	static hslToRgb(h, s, l) {
		var r, g, b;

		if (s == 0) {
			r = g = b = l; // achromatic
		} else {
			function hue2rgb(p, q, t) {
				if (t < 0) t += 1;
				if (t > 1) t -= 1;
				if (t < 1/6) return p + (q - p) * 6 * t;
				if (t < 1/2) return q;
				if (t < 2/3) return p + (q - p) * (2/3 - t) * 6;
				return p;
			}

			var q = l < 0.5 ? l * (1 + s) : l + s - l * s;
			var p = 2 * l - q;

			r = hue2rgb(p, q, h + 1/3);
			g = hue2rgb(p, q, h);
			b = hue2rgb(p, q, h - 1/3);
		}

		return [r ,g ,b];
	}

	// =================================================
	// https://gist.github.com/mjackson/5311256
	static rgbToHsv(r, g, b) {
		var max = Math.max(r, g, b), min = Math.min(r, g, b);
		var h, s, v = max;

		var d = max - min;
		s = max == 0 ? 0 : d / max;

		if (max == min) {
			h = 0; // achromatic
		} else {
			switch (max) {
				case r: h = (g - b) / d + (g < b ? 6 : 0); break;
				case g: h = (b - r) / d + 2; break;
				case b: h = (r - g) / d + 4; break;
			}

			h /= 6;
		}
		return [ h, s, v ];
	}

	// =================================================
	// https://gist.github.com/mjackson/5311256
	static hsvToRgb(h, s, v) {
		var r, g, b;

		var i = Math.floor(h * 6);
		var f = h * 6 - i;
		var p = v * (1 - s);
		var q = v * (1 - f * s);
		var t = v * (1 - (1 - f) * s);

		switch (i % 6) {
			case 0: r = v, g = t, b = p; break;
			case 1: r = q, g = v, b = p; break;
			case 2: r = p, g = v, b = t; break;
			case 3: r = p, g = q, b = v; break;
			case 4: r = t, g = p, b = v; break;
			case 5: r = v, g = p, b = q; break;
		}

		return [r, g, b];
	}

	// =================================================
	// Génère une couleur en rgb qui correspond à une
	// palette choisie.
	static randomColor(colorType)
	{
		var r, g, b;

		if(colorType == ColorsEnum.bright){
			var h = Math.random(); // [0.0, 1.0]
			var s = Math.random()*0.5 + 0.5; // [0.5, 1.0]
			var l = Math.random()*0.2 + 0.4; // [0.4, 0.6]
			var rgb = this.hslToRgb(h, s, l);
			r = rgb[0];
			g = rgb[1];
			b = rgb[2];
		} else if(colorType == ColorsEnum.pastel){
			var h = Math.random(); // [0.0, 1.0]
			var s = Math.random()*0.2 + 0.4; // [0.4, 0.6]
			var l = Math.random()*0.5 + 0.5; // [0.5, 1.0]
			var rgb = this.hslToRgb(h, s, l);
			r = rgb[0];
			g = rgb[1];
			b = rgb[2];
		} else if(colorType == ColorsEnum.dark){
			r = Math.random()*0.3; // [0.0, 0.3]
			g = Math.random()*0.3; // [0.0, 0.3]
			b = Math.random()*0.3; // [0.0, 0.3]
		} else if(colorType == ColorsEnum.light){
			r = Math.random()*0.2 + 0.8; // [0.8, 1.0]
			g = Math.random()*0.2 + 0.8; // [0.8, 1.0]
			b = Math.random()*0.2 + 0.8; // [0.8, 1.0]
		}
		else if(colorType == ColorsEnum.red){
			r = Math.random()*0.5 + 0.5; // [0.5, 1.0]
			g = Math.random()*0.5; // [0.0, 0.5]
			b = Math.random()*0.5; // [0.0, 0.5]
		} else if(colorType == ColorsEnum.green){
			r = Math.random()*0.5; // [0.0, 0.5]
			g = Math.random()*0.5 + 0.5; // [0.5, 1.0]
			b = Math.random()*0.5; // [0.0, 0.5]
		} else if(colorType == ColorsEnum.blue){
			r = Math.random()*0.5; // [0.0, 0.5]
			g = Math.random()*0.5; // [0.0, 0.5]
			b = Math.random()*0.5 + 0.5; // [0.5, 1.0]
		} else if(colorType == ColorsEnum.warm){
			var h = Math.random()*0.2; // [0.0, 0.2]
			var s = Math.random()*0.5 + 0.5; // [0.5, 1.0]
			var l = Math.random()*0.2 + 0.4; // [0.4, 0.6]
			var rgb = this.hslToRgb(h, s, l);
			r = rgb[0];
			g = rgb[1];
			b = rgb[2];
		} else if(colorType == ColorsEnum.cold){
			var h = Math.random()*0.2 + 0.5; // [0.5, 0.7]
			var s = Math.random()*0.5 + 0.5; // [0.5, 1.0]
			var l = Math.random()*0.2 + 0.4; // [0.4, 0.6]
			var rgb = this.hslToRgb(h, s, l);
			r = rgb[0];
			g = rgb[1];
			b = rgb[2];
		} else if(colorType == ColorsEnum.grey){
			var value = Math.random();
			r = g = b = value;
		} else{
			r = Math.random();
			g = Math.random();
			b = Math.random();
		}

		return [r, g, b];
	}
}
