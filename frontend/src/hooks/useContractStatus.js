import { useEffect, useState } from "react";
import ContractABI from "../assets/abi/ico.json"
// import PresaleABI from "../assets/abi/PresaleComplete.json"
import { useAccount } from "wagmi";
import { multicall, fetchBalance } from '@wagmi/core'
import { global } from "../config/global";
import { formatUnits } from "viem";
import PresaleContractABI from "../assets/abi/PresaleComplete.json";
import TokenContractABI from "../assets/abi/mintToken.json";

export function useContractStatus(refresh) {
    const [data, setData] = useState({
        tokensSold:0,
        tokenBalance:0,
        totalToken: 0,
        totalSoldAmount: 0,
        tokenPrice_num:0,
        tokenPrice_denom:0,
        totalFundsInUSD: 0,
        roundNumber: 0,
        currentTokenPrice: 0,
        plsAmountFor1USD: 0,
        nextRoundStartTime: 0,
        tokenBuyAmount: 0,
        projectTokenBalance: 0,
        payTokenBalance: [],
        payTokenAllowance: [],
        ethBalance: 0,
    })
    const { address } = useAccount();

    const [refetch, setRefetch] = useState(false)

    useEffect(() => {
        const timerID = setInterval(() => {
            setRefetch((prevData) => {
                return !prevData;
            })
        }, global.REFETCH_INTERVAL);
        
        return () => {
            clearInterval(timerID);
        };
        // eslint-disable-next-line
    }, []);
               

    useEffect(() => {
        const fetchData = async () => {
            try {
                const contract = "0x5965C2983B5c732957d28e16a0c5A819f5dBCEEC"

                const contracts = [
                    // {
                    //     address: contract,
                    //     abi: PresaleABI,
                    //     functionName: 'tokensSold',
                    // },
                    // {
                    //     address: contract,
                    //     abi: ContractABI,
                    //     functionName: 'startSaleDate',
                    // },
                ]

                const tRound = global.totalRounds + 2;
                for (let idx = 1; idx <= tRound; idx++) {
                    contracts.push({
                        address: contract,
                        abi: ContractABI,
                        functionName: 'getRoundStartTime',
                        args: [idx],
                    })
                }

                if (address) {
                    contracts.push({
                        address: contract,
                        abi: ContractABI,
                        functionName: 'tokenBuyAmount',
                        args: [address],
                    })
                    contracts.push({
                        address: contract,
                        abi: ContractABI,
                        functionName: 'balanceOf',
                        args: [address, global.PROJECT_TOKEN.address],
                    })
                    global.TOKENS.map((value, key) => {
                        return contracts.push({
                            address: contract,
                            abi: ContractABI,
                            functionName: 'balanceOf',
                            args: [address, value.address],
                        })
                    })
                    global.TOKENS.map((value, key) => {
                        return contracts.push({
                            address: contract,
                            abi: ContractABI,
                            functionName: 'allowance',
                            args: [address, contract, value.address],
                        })
                    })
                }

								const PreAddress = "0x5965C2983B5c732957d28e16a0c5A819f5dBCEEC"
								const TokAddress = "0x105EaA9Bb6CD1055987b06bEa3b36af2Ffcb2A96"
								const requests = [
									{
										address: PreAddress,
										abi: PresaleContractABI,
										functionName: 'tokensSold'
									},
									{
										address: PreAddress,
										abi: PresaleContractABI,
										functionName: 'tokenBalance'
									},
									{
										address: PreAddress,
										abi: PresaleContractABI,
										functionName: 'price_num'
									},
									{
										address: PreAddress,
										abi: PresaleContractABI,
										functionName: 'price_denom'
									},
									{
										address: TokAddress,
										abi: TokenContractABI,
										functionName: 'totalSupply'
									}
								];
								
								const data11 = await multicall({ contracts: requests });
								const { result } = data11[0];
                const _data = await multicall({
                    chainId: global.chain.id,
                    contracts
                })
                const ethBalance = address ? parseFloat((await fetchBalance({ address })).formatted) : 0
                const length = "4"
                const roundNumber = _data[2].status === "success" ? parseInt(_data[2].result) : 0;

                setData({
                    tokensSold: data11[0].status === "success" ? parseFloat(formatUnits(data11[0].result,  global.PROJECT_TOKEN.decimals)) : 0,
                    tokenBalance: data11[1].status === "success" ? parseFloat(formatUnits(data11[1].result, global.PROJECT_TOKEN.decimals)) : 0,
                    tokenPrice_denom: data11[3].status === "success" ? parseFloat(formatUnits(data11[3].result, global.PROJECT_TOKEN.decimals)) : 0,
                    totalToken: data11[4].status === "success" ? parseFloat(formatUnits(data11[4].result, global.PROJECT_TOKEN.decimals)) : 0,

                    totalSoldAmount: _data[0].status === "success" ? parseFloat(formatUnits(_data[0].result, global.PROJECT_TOKEN.decimals)) : 0,
                    totalFundsInUSD: _data[1].status === "success" ? parseFloat(formatUnits(_data[1].result, global.usdDecimals)) : 0,
                    roundNumber,
                    currentTokenPrice: _data[3].status === "success" ? parseFloat(formatUnits(_data[3].result, global.usdDecimals)) : 0,
                    plsAmountFor1USD: _data[4].status === "success" ? parseFloat(formatUnits(_data[4].result, global.chain.nativeCurrency.decimals)) : 0,
                    nextRoundStartTime: _data[5 + roundNumber].status === "success" ? parseInt(_data[5 + roundNumber].result) : 0,
                    // tokenBuyAmount: address && _data[5 + tRound].status === "success" ? parseFloat(formatUnits(_data[5 + tRound].result, global.PROJECT_TOKEN.decimals)) : 0,
                    // projectTokenBalance: address && _data[6 + tRound].status === "success" ? _data[6 + tRound].result : 0,
                    payTokenBalance: address ? _data.slice(7 + tRound, 7 + tRound + length) : [],
                    payTokenAllowance: address ? _data.slice(7 + tRound + length, 7 + tRound + 2 * length) : [],
                    ethBalance,
                })
            } catch (error) {
                console.log('useContractStatus err', error)
            }
        };
        fetchData();
        // eslint-disable-next-line
    }, [address, refetch, refresh])
    
    return data
}
