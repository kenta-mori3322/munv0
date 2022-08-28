import { txClient, wasmClient, queryClient, MissingWalletError , registry} from './module'

import { SendAuthorization } from "./module/types/cosmos/bank/v1beta1/authz"
import { Params } from "./module/types/cosmos/bank/v1beta1/bank"
import { SendEnabled } from "./module/types/cosmos/bank/v1beta1/bank"
import { Input } from "./module/types/cosmos/bank/v1beta1/bank"
import { Output } from "./module/types/cosmos/bank/v1beta1/bank"
import { Supply } from "./module/types/cosmos/bank/v1beta1/bank"
import { DenomUnit } from "./module/types/cosmos/bank/v1beta1/bank"
import { Metadata } from "./module/types/cosmos/bank/v1beta1/bank"
import { Balance } from "./module/types/cosmos/bank/v1beta1/genesis"
import { calculateFee, GasPrice, isMsgSubmitProposalEncodeObject } from "@cosmjs/stargate"

export { SendAuthorization, Params, SendEnabled, Input, Output, Supply, DenomUnit, Metadata, Balance };

async function initTxClient(vuexGetters) {
	return await txClient(vuexGetters['common/wallet/signer'], {
		addr: vuexGetters['common/env/apiTendermint']
	})
}

async function initCosmClient(vuexGetters) {
	return await wasmClient(vuexGetters['common/wallet/signer'], {
		addr: vuexGetters['common/env/apiTendermint']
	})
}
async function initQueryClient(vuexGetters) {
	return await queryClient({
		addr: vuexGetters['common/env/apiCosmos']
	})
}

function mergeResults(value, next_values) {
	for (let prop of Object.keys(next_values)) {
		if (Array.isArray(next_values[prop])) {
			value[prop]=[...value[prop], ...next_values[prop]]
		}else{
			value[prop]=next_values[prop]
		}
	}
	return value
}

function getStructure(template) {
	let structure = { fields: [] }
	for (const [key, value] of Object.entries(template)) {
		let field: any = {}
		field.name = key
		field.type = typeof value
		structure.fields.push(field)
	}
	return structure
}

const getDefaultState = () => {
	return {
				Balance: {},
				AllBalances: {},
				AllTokenBalances: {},
				TotalSupply: {},
				SupplyOf: {},
				Params: {},
				DenomMetadata: {},
				DenomsMetadata: {},
				
				_Structure: {
						SendAuthorization: getStructure(SendAuthorization.fromPartial({})),
						Params: getStructure(Params.fromPartial({})),
						SendEnabled: getStructure(SendEnabled.fromPartial({})),
						Input: getStructure(Input.fromPartial({})),
						Output: getStructure(Output.fromPartial({})),
						Supply: getStructure(Supply.fromPartial({})),
						DenomUnit: getStructure(DenomUnit.fromPartial({})),
						Metadata: getStructure(Metadata.fromPartial({})),
						Balance: getStructure(Balance.fromPartial({})),
						
		},
		_Registry: registry,
		_Subscriptions: new Set(),
	}
}

// initial state
const state = getDefaultState()

export default {
	namespaced: true,
	state,
	mutations: {
		RESET_STATE(state) {
			Object.assign(state, getDefaultState())
		},
		QUERY(state, { query, key, value }) {
			state[query][JSON.stringify(key)] = value
		},
		SUBSCRIBE(state, subscription) {
			state._Subscriptions.add(JSON.stringify(subscription))
		},
		UNSUBSCRIBE(state, subscription) {
			state._Subscriptions.delete(JSON.stringify(subscription))
		}
	},
	getters: {
				getBalance: (state) => (params = { params: {}}) => {
					if (!(<any> params).query) {
						(<any> params).query=null
					}
			return state.Balance[JSON.stringify(params)] ?? {}
		},
				getAllBalances: (state) => (params = { params: {}}) => {
					if (!(<any> params).query) {
						(<any> params).query=null
					}
			return state.AllBalances[JSON.stringify(params)] ?? {}
		},
				getAllTokenBalances: (state) => (params = { params: {}}) => {
					if (!(<any> params).query) {
						(<any> params).query=null
					}
			return state.AllTokenBalances[JSON.stringify(params)] ?? {}
		},
				getTotalSupply: (state) => (params = { params: {}}) => {
					if (!(<any> params).query) {
						(<any> params).query=null
					}
			return state.TotalSupply[JSON.stringify(params)] ?? {}
		},
				getSupplyOf: (state) => (params = { params: {}}) => {
					if (!(<any> params).query) {
						(<any> params).query=null
					}
			return state.SupplyOf[JSON.stringify(params)] ?? {}
		},
				getParams: (state) => (params = { params: {}}) => {
					if (!(<any> params).query) {
						(<any> params).query=null
					}
			return state.Params[JSON.stringify(params)] ?? {}
		},
				getDenomMetadata: (state) => (params = { params: {}}) => {
					if (!(<any> params).query) {
						(<any> params).query=null
					}
			return state.DenomMetadata[JSON.stringify(params)] ?? {}
		},
				getDenomsMetadata: (state) => (params = { params: {}}) => {
					if (!(<any> params).query) {
						(<any> params).query=null
					}
			return state.DenomsMetadata[JSON.stringify(params)] ?? {}
		},
				
		getTypeStructure: (state) => (type) => {
			return state._Structure[type].fields
		},
		getRegistry: (state) => {
			return state._Registry
		}
	},
	actions: {
		init({ dispatch, rootGetters }) {
			console.log('Vuex module: cosmos.bank.v1beta1 initialized!')
			if (rootGetters['common/env/client']) {
				rootGetters['common/env/client'].on('newblock', () => {
					dispatch('StoreUpdate')
				})
			}
		},
		resetState({ commit }) {
			commit('RESET_STATE')
		},
		unsubscribe({ commit }, subscription) {
			commit('UNSUBSCRIBE', subscription)
		},
		async StoreUpdate({ state, dispatch }) {
			state._Subscriptions.forEach(async (subscription) => {
				try {
					const sub=JSON.parse(subscription)
					await dispatch(sub.action, sub.payload)
				}catch(e) {
					throw new Error('Subscriptions: ' + e.message)
				}
			})
		},
		
		
		
		 		
		
		
		async QueryBalance({ commit, rootGetters, getters }, { options: { subscribe, all} = { subscribe:false, all:false}, params, query=null }) {
			try {
				const key = params ?? {};
				const queryClient=await initQueryClient(rootGetters)
				let value= (await queryClient.queryBalance( key.address, query)).data
				
					
				while (all && (<any> value).pagination && (<any> value).pagination.next_key!=null) {
					let next_values=(await queryClient.queryBalance( key.address, {...query, 'pagination.key':(<any> value).pagination.next_key})).data
					value = mergeResults(value, next_values);
				}
				commit('QUERY', { query: 'Balance', key: { params: {...key}, query}, value })
				if (subscribe) commit('SUBSCRIBE', { action: 'QueryBalance', payload: { options: { all }, params: {...key},query }})
				return getters['getBalance']( { params: {...key}, query}) ?? {}
			} catch (e) {
				throw new Error('QueryClient:QueryBalance API Node Unavailable. Could not perform query: ' + e.message)
				
			}
		},
		
		
		
		
		 		
		
		
		async QueryAllBalances({ commit, rootGetters, getters }, { options: { subscribe, all} = { subscribe:false, all:false}, params, query=null }) {
			try {
				const key = params ?? {};
				const queryClient=await initQueryClient(rootGetters)
				let value= (await queryClient.queryAllBalances( key.address, query)).data
				
					
				while (all && (<any> value).pagination && (<any> value).pagination.next_key!=null) {
					let next_values=(await queryClient.queryAllBalances( key.address, {...query, 'pagination.key':(<any> value).pagination.next_key})).data
					value = mergeResults(value, next_values);
				}
				commit('QUERY', { query: 'AllBalances', key: { params: {...key}, query}, value })
				if (subscribe) commit('SUBSCRIBE', { action: 'QueryAllBalances', payload: { options: { all }, params: {...key},query }})
				return getters['getAllBalances']( { params: {...key}, query}) ?? {}
			} catch (e) {
				throw new Error('QueryClient:QueryAllBalances API Node Unavailable. Could not perform query: ' + e.message)
				
			}
		},
		
		async QueryAllTokenBalances({ commit, rootGetters, getters }, { options: { subscribe, all} = { subscribe:false, all:false}, params, query=null }) {
			try {
				const key = params ?? {};
				const wasmClient = await initCosmClient(rootGetters)
				let balance = await wasmClient.queryContractSmart(key.tokenAddress,
				{
					balance:{
						address: key.address
					}
				})
				
				let balances = [{denom: 'DGM', amount: balance.balance}]
				let value = { balances:balances, pagination:{next_key: null, total: '1'}}

				commit('QUERY', { query: 'AllTokenBalances', key: { params: {...key}, query}, value })
				if (subscribe) commit('SUBSCRIBE', { action: 'QueryAllTokenBalances', payload: { options: { all }, params: {...key},query }})
				return getters['getAllTokenBalances']( { params: {...key}, query}) ?? {}
			} catch (e) {
				console.log(e)
				throw new Error('QueryClient:QueryAllTokenBalances API Node Unavailable. Could not perform query: ' + e.message)
				
			}
		},
		
		
		 		
		
		
		async QueryTotalSupply({ commit, rootGetters, getters }, { options: { subscribe, all} = { subscribe:false, all:false}, params, query=null }) {
			try {
				const key = params ?? {};
				const queryClient=await initQueryClient(rootGetters)
				let value= (await queryClient.queryTotalSupply(query)).data
				
					
				while (all && (<any> value).pagination && (<any> value).pagination.next_key!=null) {
					let next_values=(await queryClient.queryTotalSupply({...query, 'pagination.key':(<any> value).pagination.next_key})).data
					value = mergeResults(value, next_values);
				}
				commit('QUERY', { query: 'TotalSupply', key: { params: {...key}, query}, value })
				if (subscribe) commit('SUBSCRIBE', { action: 'QueryTotalSupply', payload: { options: { all }, params: {...key},query }})
				return getters['getTotalSupply']( { params: {...key}, query}) ?? {}
			} catch (e) {
				throw new Error('QueryClient:QueryTotalSupply API Node Unavailable. Could not perform query: ' + e.message)
				
			}
		},
		
		
		
		
		 		
		
		
		async QuerySupplyOf({ commit, rootGetters, getters }, { options: { subscribe, all} = { subscribe:false, all:false}, params, query=null }) {
			try {
				const key = params ?? {};
				const queryClient=await initQueryClient(rootGetters)
				let value= (await queryClient.querySupplyOf( key.denom)).data
				
					
				commit('QUERY', { query: 'SupplyOf', key: { params: {...key}, query}, value })
				if (subscribe) commit('SUBSCRIBE', { action: 'QuerySupplyOf', payload: { options: { all }, params: {...key},query }})
				return getters['getSupplyOf']( { params: {...key}, query}) ?? {}
			} catch (e) {
				throw new Error('QueryClient:QuerySupplyOf API Node Unavailable. Could not perform query: ' + e.message)
				
			}
		},
		
		
		
		
		 		
		
		
		async QueryParams({ commit, rootGetters, getters }, { options: { subscribe, all} = { subscribe:false, all:false}, params, query=null }) {
			try {
				const key = params ?? {};
				const queryClient=await initQueryClient(rootGetters)
				let value= (await queryClient.queryParams()).data
				
					
				commit('QUERY', { query: 'Params', key: { params: {...key}, query}, value })
				if (subscribe) commit('SUBSCRIBE', { action: 'QueryParams', payload: { options: { all }, params: {...key},query }})
				return getters['getParams']( { params: {...key}, query}) ?? {}
			} catch (e) {
				throw new Error('QueryClient:QueryParams API Node Unavailable. Could not perform query: ' + e.message)
				
			}
		},
		
		
		
		
		 		
		
		
		async QueryDenomMetadata({ commit, rootGetters, getters }, { options: { subscribe, all} = { subscribe:false, all:false}, params, query=null }) {
			try {
				const key = params ?? {};
				const queryClient=await initQueryClient(rootGetters)
				let value= (await queryClient.queryDenomMetadata( key.denom)).data
				
					
				commit('QUERY', { query: 'DenomMetadata', key: { params: {...key}, query}, value })
				if (subscribe) commit('SUBSCRIBE', { action: 'QueryDenomMetadata', payload: { options: { all }, params: {...key},query }})
				return getters['getDenomMetadata']( { params: {...key}, query}) ?? {}
			} catch (e) {
				throw new Error('QueryClient:QueryDenomMetadata API Node Unavailable. Could not perform query: ' + e.message)
				
			}
		},
		
		
		
		
		 		
		
		
		async QueryDenomsMetadata({ commit, rootGetters, getters }, { options: { subscribe, all} = { subscribe:false, all:false}, params, query=null }) {
			try {
				const key = params ?? {};
				const queryClient=await initQueryClient(rootGetters)
				let value= (await queryClient.queryDenomsMetadata(query)).data
				
					
				while (all && (<any> value).pagination && (<any> value).pagination.next_key!=null) {
					let next_values=(await queryClient.queryDenomsMetadata({...query, 'pagination.key':(<any> value).pagination.next_key})).data
					value = mergeResults(value, next_values);
				}
				commit('QUERY', { query: 'DenomsMetadata', key: { params: {...key}, query}, value })
				if (subscribe) commit('SUBSCRIBE', { action: 'QueryDenomsMetadata', payload: { options: { all }, params: {...key},query }})
				return getters['getDenomsMetadata']( { params: {...key}, query}) ?? {}
			} catch (e) {
				throw new Error('QueryClient:QueryDenomsMetadata API Node Unavailable. Could not perform query: ' + e.message)
				
			}
		},
		
		
		async sendMsgMultiSend({ rootGetters }, { value, fee = [], memo = '' }) {
			try {
				const txClient=await initTxClient(rootGetters)
				const msg = await txClient.msgMultiSend(value)
				const result = await txClient.signAndBroadcast([msg], {fee: { amount: fee, 
	gas: "200000" }, memo})
				return result
			} catch (e) {
				if (e == MissingWalletError) {
					throw new Error('TxClient:MsgMultiSend:Init Could not initialize signing client. Wallet is required.')
				}else{
					throw new Error('TxClient:MsgMultiSend:Send Could not broadcast Tx: '+ e.message)
				}
			}
		},
		async sendMsgSend({ rootGetters }, { value, fee = [], memo = '' }) {
			try {
				const txClient=await initTxClient(rootGetters)
				const msg = await txClient.msgSend(value)

				const result = await txClient.signAndBroadcast([msg], {fee: { amount: fee, 
	gas: "200000" }, memo})
				return result
			} catch (e) {
				if (e == MissingWalletError) {
					throw new Error('TxClient:MsgSend:Init Could not initialize signing client. Wallet is required.')
				}else{
					throw new Error('TxClient:MsgSend:Send Could not broadcast Tx: '+ e.message)
				}
			}
		},
		async sendMsgTokenSend({ rootGetters }, { value, fee = [], memo = '' }) {
			try {
				const wasmClient = await initCosmClient(rootGetters)
				const gasPrice = GasPrice.fromString("0.05utmun");
				const executeFee = calculateFee(300_000, gasPrice);

				const msgSend =
				{
					transfer: {
						recipient: value.to_address,
						amount: value.amount[0].amount
					}
			
				}
			
				const result = await wasmClient.execute(
					value.from_address,
					value.tokenAddress,
					msgSend,
					executeFee,
					"",
				);

				return result
			} catch (e) {
				if (e == MissingWalletError) {
					throw new Error('TxClient:MsgTokenSend:Init Could not initialize signing client. Wallet is required.')
				}else{
					throw new Error('TxClient:MsgTokenSend:Token Send Could not broadcast Tx: '+ e.message)
				}
			}
		},
		async MsgMultiSend({ rootGetters }, { value }) {
			try {
				const txClient=await initTxClient(rootGetters)
				const msg = await txClient.msgMultiSend(value)
				return msg
			} catch (e) {
				if (e == MissingWalletError) {
					throw new Error('TxClient:MsgMultiSend:Init Could not initialize signing client. Wallet is required.')
				}else{
					throw new Error('TxClient:MsgMultiSend:Create Could not create message: ' + e.message)
				}
			}
		},
		async MsgSend({ rootGetters }, { value }) {
			try {
				const txClient=await initTxClient(rootGetters)
				const msg = await txClient.msgSend(value)
				return msg
			} catch (e) {
				if (e == MissingWalletError) {
					throw new Error('TxClient:MsgSend:Init Could not initialize signing client. Wallet is required.')
				}else{
					throw new Error('TxClient:MsgSend:Create Could not create message: ' + e.message)
				}
			}
		},
		
	}
}
