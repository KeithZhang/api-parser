export interface ShopDeliveryAddressLisRequest  {
              
            }export interface ShopDeliveryAddressLisResponse {
        province: string;city: string;district: string;address: string;
      }const shopDeliveryAddressLis = async () : Promise<ShopDeliveryAddressLisResponse> => {
            return await PantherSdk.get({ url: '/shop/delivery/address/list',  });
          };export interface ShopDeliveryAddressDeleteRequest  {
              
            }export interface ShopDeliveryAddressDeleteResponse {
        
      }const shopDeliveryAddressDelete = async (index: string, ) :Promise<ShopDeliveryAddressDeleteResponse>  => {
            return await PantherSdk.get({ url: `/shop/delivery/address/delete/${index}`,  });
          };export interface ShopDeliveryAddressInfoRequest  {
              
            }export interface ShopDeliveryAddressInfoResponse {
        province: string;city: string;district: string;address: string;
      }const shopDeliveryAddressInfo = async (index: string, ) :Promise<ShopDeliveryAddressInfoResponse>  => {
            return await PantherSdk.get({ url: `/shop/delivery/address/info/${index}`,  });
          };export interface ShopInfRequest  {
              
            }const shopInf = async () : Promise<any> => {
            return await PantherSdk.get({ url: '/shop/info',  });
          };export interface GoodsInfoRequest  {
              
            }export interface GoodsInfoResponse {
        id: string;name: string;image: string;images: string;blemishImages: string;newPrice: string;retailPrice: string;wholePrice: string;quality: string;description: string;
      }const goodsInfo = async (id: string, params?: GoodsInfoRequest) :Promise<GoodsInfoResponse>  => {
            return await PantherSdk.get({ url: `/goods/info/${id}`, params });
          };export interface ShareDeleteRequest  {
              
            }export interface ShareDeleteResponse {
        
      }const shareDelete = async (id: string, ) :Promise<ShareDeleteResponse>  => {
            return await PantherSdk.get({ url: `/share/delete/${id}`,  });
          };export interface OrderReceiveRequest  {
              
            }export interface OrderReceiveResponse {
        
      }const orderReceive = async (id: string, ) :Promise<OrderReceiveResponse>  => {
            return await PantherSdk.get({ url: `/order/receive/${id}`,  });
          };export interface OrderLogisticsRequest  {
              
            }const orderLogistics = async (id: string, ) :Promise<any>  => {
            return await PantherSdk.get({ url: `/order/logistics/${id}`,  });
          };export interface OrderFindRequest  {
              
            }export interface Price {
        total: number;freight: number;price: number;
      }export interface Goods {
        id: string;name: string;quality: string;
      }export interface DeliveryAddress {
        consignee: string;consigneePhone: string;province: string;city: string;district: string;address: string;
      }export interface Buyer {
        deliveryAddress: DeliveryAddress;
      }export interface OrderFindResponse {
        id: string;status: string;price: Price;goods: Goods;buyer: Buyer;
      }const orderFind = async (id: string, ) :Promise<OrderFindResponse>  => {
            return await PantherSdk.get({ url: `/order/find/${id}`,  });
          };