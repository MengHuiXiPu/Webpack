class SyncHook{
    constructor(args=[]){
        this._args=args;
        this.taps=[]
    }
    tap(name,fn){
        this.taps.push(fn)
    }

    call(...args){

        const tapsLength=this.taps.length;
        for(let i=0;i<this.tapsLength;i++){
            const fn=this.taps[i]
            fn(...args)
        }
    }
}


s