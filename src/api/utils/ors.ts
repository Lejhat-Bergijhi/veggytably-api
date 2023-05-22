/**
 * Open Route Service API
 * @see https://openrouteservice.org/dev/#/api-docs
 */
class Ors {
  private apiKey: string;
  private baseUrl: string;

  constructor(baseUrl = "https://api.openrouteservice.org") {
    this.apiKey = process.env.ORS_API_KEY;
    this.baseUrl = baseUrl;
  }

  // directions
  async getDirections(
    start: { latitude: number; longitude: number },
    end: { latitude: number; longitude: number }
  ) {
    const url = `${this.baseUrl}/v2/directions/driving-car?api_key=${this.apiKey}&start=${start.longitude},${start.latitude}&end=${end.longitude},${end.latitude}`;

    const response = await fetch(url);
    const data = await response.json();

    return data;
  }

  parseDirectionResponse(data: any) {
    const { features } = data;

    const route = features[0].geometry.coordinates;
    const { distance, duration } = features[0].properties.summary;

    return { route, distance, duration };
  }

  // geocode
  async searchGeocode(query: string, boundaryCountry = "ID") {
    const url = `${this.baseUrl}/geocode/search?api_key=${this.apiKey}&text=${query}&boundary.country=${boundaryCountry}`;

    const response = await fetch(url);
    const data = await response.json();

    return data;
  }

  async reverseGeocode(
    longitude: number,
    latitude: number,
    boundaryCountry = "ID",
    boundaryCircleRadius = 1,
    size = 1,
    layers = "address,street,region,venue"
  ) {
    const url = `${this.baseUrl}/geocode/reverse?api_key=${this.apiKey}&point.lon=${longitude}&point.lat=${latitude}&boundary.circle.radius=${boundaryCircleRadius}&size=${size}&layers=${layers}&boundary.country=${boundaryCountry}`;

    const response = await fetch(url);
    const data = await response.json();

    return data;
  }
}
const ors = new Ors();
export { ors, Ors };
