package keeper_test

import (
	"strconv"
	"testing"

	sdk "github.com/cosmos/cosmos-sdk/types"
	"github.com/stretchr/testify/require"
	keepertest "mun/testutil/keeper"
	"mun/testutil/nullify"
	"mun/x/mun/keeper"
	"mun/x/mun/types"
)

// Prevent strconv unused error
var _ = strconv.IntSize

func createNVersion(keeper *keeper.Keeper, ctx sdk.Context, n int) []types.Version {
	items := make([]types.Version, n)
	for i := range items {
		items[i].Index = strconv.Itoa(i)

		keeper.SetVersion(ctx, items[i])
	}
	return items
}

func TestVersionGet(t *testing.T) {
	keeper, ctx := keepertest.MunKeeper(t)
	items := createNVersion(keeper, ctx, 10)
	for _, item := range items {
		rst, found := keeper.GetVersion(ctx,
			item.Index,
		)
		require.True(t, found)
		require.Equal(t,
			nullify.Fill(&item),
			nullify.Fill(&rst),
		)
	}
}
func TestVersionRemove(t *testing.T) {
	keeper, ctx := keepertest.MunKeeper(t)
	items := createNVersion(keeper, ctx, 10)
	for _, item := range items {
		keeper.RemoveVersion(ctx,
			item.Index,
		)
		_, found := keeper.GetVersion(ctx,
			item.Index,
		)
		require.False(t, found)
	}
}

func TestVersionGetAll(t *testing.T) {
	keeper, ctx := keepertest.MunKeeper(t)
	items := createNVersion(keeper, ctx, 10)
	require.ElementsMatch(t,
		nullify.Fill(items),
		nullify.Fill(keeper.GetAllVersion(ctx)),
	)
}
