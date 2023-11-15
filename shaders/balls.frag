precision mediump float;

#define M_1_PI 0.31830988618
#define M_PI 3.1415926535897932384626433832795

uniform int uDisplayMode;

varying vec4 vCoord;
varying float vRadius;
varying vec4 vColor;

varying float vNi;
varying float vSigma;
varying vec4 vLight;

uniform vec3 uLightColor;
uniform float uLightIntensity;

vec3 lambert(vec3 wi, vec3 wo, vec3 n, vec3 kd)
{
    vec3 fr = vec3(0.0, 0.0, 0.0);
    if(dot(wi, n) <= 0.0){
        return fr;
    }
    fr = kd * M_1_PI;
    return fr;
}

/*
wi : direction d'incidence
wo : direction du vectru d'observation
n : normale au point
kd : composante diffuse du matériau
*/
vec3 cooktorrance(vec3 wi, vec3 wo, vec3 n, vec3 ks)
{
    vec3 fr = vec3(0.0, 0.0, 0.0);
    vec3 h = normalize(wi + wo);

    float dotIN = dot(wi, n);
    float dotON = dot(wo, n);

    if(dotIN <= 0.0){
        return fr;
    }

    float dotHO = dot(h, wo); // (H.O)
    float dotHN = max(0.0, dot(h, n)); // (H.N)

    //calcul de F (coefficient de Fresnel)
    float c = abs(dotHO);
    float g = vNi * vNi + c * c - 1.0;
    g = sqrt(g);
    float gmc = g - c;
    float gpc = g + c;
    float f1 = 0.5 * (gmc * gmc) / (gpc * gpc);
    float f2 = 1.0 + ((c * gpc - 1.0)*(c * gpc - 1.0)) / ((c * gmc + 1.0)*(c * gmc + 1.0));
    float F = f1 * f2;


    //calcul de G
    float G = 1.0;
    if(dotHO != 0.0){
        float g1 = (2.0 * dotON * dotHN) / dotHO;
        float g2 = (2.0 * dotIN * dotHN) / dotHO;
        G = min(1.0, min(g1, g2));
    }


    //calcul de D (distribution de beckmann)
    // D = exp(-tan2/(m*m)) / (pi*m*m*cos4)
    // tan = sin/cos
    // tan2 = sin2/cos2
    // tan2 = (1-cos2)/cos2
    // D = exp((cos2-1)/(m*m*cos2)) / (pi*m*m*cos4)
    float D = 1.0;
    if(dotHN != 0.0){
        float dot2HN = dotHN * dotHN;
        float d1 = exp((dot2HN - 1.0)/(vSigma * vSigma * dot2HN));
        float d2 = M_PI * vSigma * vSigma * dot2HN * dot2HN;
        D = d1/d2;
    }

    //Calcul final
    float CT = (F*D*G) / (dotON * dotIN * 4.0);

    //Calcul de fr
    fr = ks * CT;
    //fr = vec3(0.3) * CT;
    return fr;
}

void main(void)
{
	vec2 posInQuad = 2.0 * gl_PointCoord - 1.0;
	float dist = dot(posInQuad, posInQuad);

	if (dist > 1.0) {
        discard;
    }

    float bordure = 0.0;
    if (dist > 1.0 - bordure){
        gl_FragColor = vec4(0.0, 0.0, 0.0, 1.0);
    }

    else{
		vec3 pos3D = vec3(posInQuad.x,
							  -posInQuad.y,
							  sqrt(1.0 - posInQuad.x * posInQuad.x - posInQuad.y * posInQuad.y));
		vec3 normal = normalize(pos3D);
		pos3D = vCoord.xyz + normal * vRadius;
		vec3 posToLight = normalize(vLight.xyz - pos3D);
        vec3 posToEye = normalize(- pos3D);

        float cosTheta = dot(posToLight, normal);

        /* uDisplayMode permet de choisir quelle représentation donner
        aux sphères. Ceci afin de permettre un debugage du code durant les
        étapes de calcul faites précemment. */
		if(uDisplayMode == 0) // dégradé
        {
			gl_FragColor = vec4(vColor.rgb * (dist/2.0 + 0.5), vColor.a);
		}
        else if(uDisplayMode == 1) // brdf lambert
        {
            vec3 Lo = vec3(0.0);
            if(cosTheta > 0.0){
                vec3 fr = lambert(posToLight, posToEye, normal, vColor.rgb);
                Lo = uLightColor.rgb * uLightIntensity * fr * cosTheta;
            }
			gl_FragColor = vec4(Lo, vColor.a);
		}
        else if(uDisplayMode == 2) // brdf cook torrance
        {
            vec3 Lo = vec3(0.0);
            if(cosTheta > 0.0){
                vec3 fr = lambert(posToLight, posToEye, normal, vColor.rgb) + cooktorrance(posToLight, posToEye, normal, vec3(0.8));
                Lo = uLightColor.rgb * uLightIntensity * fr * cosTheta;
            }
			gl_FragColor = vec4(Lo, vColor.a);
		}
        else if(uDisplayMode == 3) // normale
        {
			gl_FragColor = vec4(normal, 1.0);
		}
        else if(uDisplayMode == 4) // position
        {
			gl_FragColor = vec4(pos3D, 1.0);
		}
        else if(uDisplayMode == 5) // vecteur de la camera vers la position dans le monde
        {
			gl_FragColor = vec4(posToEye, 1.0);
		}
        else if(uDisplayMode == 6) // vecteur de la lumière vers la position dans le monde
        {
			gl_FragColor = vec4(posToLight, 1.0);
		}
        else // inconnu
        {
			gl_FragColor = vec4(0.0, 0.0, 0.0, 1.0);
		}
	}
}
