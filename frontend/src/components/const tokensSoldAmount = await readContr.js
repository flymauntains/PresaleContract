const tokensSoldAmount =  await readContract({
    address: "0x58C02D30Fb971844Bf6993455Ddd0ddd27f7C598",
    abi: PresaleContractABI,
    functionName: 'tokensSold'
})
const tokenBalance =  await readContract({
    address: "0x58C02D30Fb971844Bf6993455Ddd0ddd27f7C598",
    abi: PresaleContractABI,
    functionName: 'getTokenSold'
})
const price_num =  await readContract({
    address: "0x58C02D30Fb971844Bf6993455Ddd0ddd27f7C598",
    abi: PresaleContractABI,
    functionName: 'price_num'
})
const price_denom =  await readContract({
    address: "0x58C02D30Fb971844Bf6993455Ddd0ddd27f7C598",
    abi: PresaleContractABI,
    functionName: 'price_denom'
})
const totalSupply = await readContract({
    address: "0x105EaA9Bb6CD1055987b06bEa3b36af2Ffcb2A96",
    abi: TokenContractABI,
    functionName: 'totalSupply'
})

const data = await readContracts({
    ...
  })
  
const { result } = data[0]
  