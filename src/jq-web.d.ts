declare module 'jq-web' {
    interface JqInstance {
        json: (data: any, filter: string) => any;
        raw: (input: string, filter: string, flags?: any) => string;
    }
    const jqFactory: Promise<JqInstance>;
    export default jqFactory;
}
