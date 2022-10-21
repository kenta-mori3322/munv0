package keeper

import (
	"github.com/cosmos/cosmos-sdk/store/prefix"
	sdk "github.com/cosmos/cosmos-sdk/types"
	"mun/x/mun/types"
)

// SetVersion set a specific version in the store from its index
func (k Keeper) SetVersion(ctx sdk.Context, version types.Version) {
	store := prefix.NewStore(ctx.KVStore(k.storeKey), types.KeyPrefix(types.VersionKeyPrefix))
	b := k.cdc.MustMarshal(&version)
	store.Set(types.VersionKey(
		version.Index,
	), b)
}

// GetVersion returns a version from its index
func (k Keeper) GetVersion(
	ctx sdk.Context,
	index string,

) (val types.Version, found bool) {
	store := prefix.NewStore(ctx.KVStore(k.storeKey), types.KeyPrefix(types.VersionKeyPrefix))

	b := store.Get(types.VersionKey(
		index,
	))
	if b == nil {
		return val, false
	}

	k.cdc.MustUnmarshal(b, &val)
	return val, true
}

// RemoveVersion removes a version from the store
func (k Keeper) RemoveVersion(
	ctx sdk.Context,
	index string,

) {
	store := prefix.NewStore(ctx.KVStore(k.storeKey), types.KeyPrefix(types.VersionKeyPrefix))
	store.Delete(types.VersionKey(
		index,
	))
}

// GetAllVersion returns all version
func (k Keeper) GetAllVersion(ctx sdk.Context) (list []types.Version) {
	store := prefix.NewStore(ctx.KVStore(k.storeKey), types.KeyPrefix(types.VersionKeyPrefix))
	iterator := sdk.KVStorePrefixIterator(store, []byte{})

	defer iterator.Close()

	for ; iterator.Valid(); iterator.Next() {
		var val types.Version
		k.cdc.MustUnmarshal(iterator.Value(), &val)
		list = append(list, val)
	}

	return
}
