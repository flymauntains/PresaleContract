import { readContract } from '@wagmi/core'


const pjs =  readContract({
    address: "0x58C02D30Fb971844Bf6993455Ddd0ddd27f7C598",
    abi: PresaleContract,
    functionName: 'tokensSold'
})
