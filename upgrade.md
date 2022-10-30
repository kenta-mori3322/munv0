# How to upgrade to mun-upgrade-v2
## 1. Vote 'yes' to upgrade proposal
```
mund tx gov vote [proposal_id] yes --from [wallet_name] --chain-id testmun --keyring-backend test -y
```

## 2. Upgrade binary (should be 0.1.2)
```
cd ~/mun
git pull
make install
mund version
```

## 3. Copy binary to upgrade folder
```
cd ~/.mun/upgrade_manager/upgrades
mkdir mun-upgrade-v2
cd mun-upgrade-v2
mkdir bin
cp ~/go/bin/mund .
```

## 4. Update mund.service configuration
```
sudo sed -i 's/=on/=true/g' /etc/systemd/system/mund.service
sudo sed -i 's/=true-/=on-/g' /etc/systemd/system/mund.service
sudo systemctl daemon-reload
sudo systemctl restart mund.service
```

## 5. Done, It will be upgraded when Munchain reaches to the upgrade block height. 