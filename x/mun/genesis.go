package mun

import (
	sdk "github.com/cosmos/cosmos-sdk/types"
	"mun/x/mun/keeper"
	"mun/x/mun/types"
)

// InitGenesis initializes the capability module's state from a provided genesis
// state.
func InitGenesis(ctx sdk.Context, k keeper.Keeper, genState types.GenesisState) {
	// Set all the version
	for _, elem := range genState.VersionList {
		k.SetVersion(ctx, elem)
	}
	// this line is used by starport scaffolding # genesis/module/init
	k.SetParams(ctx, genState.Params)
}

// ExportGenesis returns the capability module's exported genesis.
func ExportGenesis(ctx sdk.Context, k keeper.Keeper) *types.GenesisState {
	genesis := types.DefaultGenesis()
	genesis.Params = k.GetParams(ctx)

	genesis.VersionList = k.GetAllVersion(ctx)
	// this line is used by starport scaffolding # genesis/module/export

	return genesis
}
