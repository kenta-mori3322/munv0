// THIS FILE IS GENERATED AUTOMATICALLY. DO NOT MODIFY.

import MunAllocV1Beta1 from './mun.alloc.v1beta1'
import MunClaimV1Beta1 from './mun.claim.v1beta1'
import MunMun from './mun.mun'


export default { 
  MunAllocV1Beta1: load(MunAllocV1Beta1, 'mun.alloc.v1beta1'),
  MunClaimV1Beta1: load(MunClaimV1Beta1, 'mun.claim.v1beta1'),
  MunMun: load(MunMun, 'mun.mun'),
  
}


function load(mod, fullns) {
    return function init(store) {        
        if (store.hasModule([fullns])) {
            throw new Error('Duplicate module name detected: '+ fullns)
        }else{
            store.registerModule([fullns], mod)
            store.subscribe((mutation) => {
                if (mutation.type == 'common/env/INITIALIZE_WS_COMPLETE') {
                    store.dispatch(fullns+ '/init', null, {
                        root: true
                    })
                }
            })
        }
    }
}