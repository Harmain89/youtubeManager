class ApiResponse {
    constructor(statusCode, data, message="Success") {

        this.statusCode = statusCode
        this.data = data
        this.message = message
        this.success = statusCode < 400

        return this; // this keyword returns an object {} , and it may also be returned automatically if we do not return it manually.
    }
}


export { ApiResponse }