import axios from "axios";

const API_URL = "http://localhost:3000/api/v1/orders";

export const createOrder = async (orderData) => {
    const response = await axios.post(API_URL, orderData);
    return response.data.data;
};