package keeper

import (
	"context"

	"github.com/cosmos/cosmos-sdk/store/prefix"
	sdk "github.com/cosmos/cosmos-sdk/types"
	"github.com/cosmos/cosmos-sdk/types/query"
	"google.golang.org/grpc/codes"
	"google.golang.org/grpc/status"
	"mun/x/mun/types"
)

func (k Keeper) VersionAll(c context.Context, req *types.QueryAllVersionRequest) (*types.QueryAllVersionResponse, error) {
	if req == nil {
		return nil, status.Error(codes.InvalidArgument, "invalid request")
	}

	var versions []types.Version
	ctx := sdk.UnwrapSDKContext(c)

	store := ctx.KVStore(k.storeKey)
	versionStore := prefix.NewStore(store, types.KeyPrefix(types.VersionKeyPrefix))

	pageRes, err := query.Paginate(versionStore, req.Pagination, func(key []byte, value []byte) error {
		var version types.Version
		if err := k.cdc.Unmarshal(value, &version); err != nil {
			return err
		}

		versions = append(versions, version)
		return nil
	})

	if err != nil {
		return nil, status.Error(codes.Internal, err.Error())
	}

	return &types.QueryAllVersionResponse{Version: versions, Pagination: pageRes}, nil
}

func (k Keeper) Version(c context.Context, req *types.QueryGetVersionRequest) (*types.QueryGetVersionResponse, error) {
	if req == nil {
		return nil, status.Error(codes.InvalidArgument, "invalid request")
	}
	ctx := sdk.UnwrapSDKContext(c)

	val, found := k.GetVersion(
		ctx,
		req.Index,
	)
	if !found {
		return nil, status.Error(codes.NotFound, "not found")
	}

	return &types.QueryGetVersionResponse{Version: val}, nil
}
