declare module '@michaelhomer/jqjs' {
    function jq(filter: string, data: any): Iterable<any>
    namespace jq {
        function compile(filter: string): (data: any) => Iterable<any>
    }
    export default jq
}
