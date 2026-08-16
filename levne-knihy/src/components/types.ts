
export default interface ApiResponse<T> {
    status: string;
    data: T;
}