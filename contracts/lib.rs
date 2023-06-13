#![cfg_attr(not(feature = "std"), no_std, no_main)]

#[ink::contract]
mod LshIndex {

    use ink::storage::Mapping;
    use ink::prelude::vec::Vec;

    #[ink(storage)]
    pub struct LshIndex {
        indexes: Mapping<u32, Vec<Vec<u8>>>,
        lsh_params: Mapping<u8, Vec<u8>>,
        is_registerd: Mapping<Vec<u8>, bool>,
        total_lsh: u8,
    }

    impl LshIndex {
        #[ink(constructor)]
        pub fn new() -> Self {
            Self { 
                indexes: Mapping::new(),
                is_registerd: Mapping::new(),
                lsh_params: Mapping::new(),
                total_lsh: 0,
            }
        }

        // #[ink(message)]
        // pub fn add_data(&mut self, idx:u8, hash:u32, data:Vec<u8>) {
        //     assert!(!self.is_registerd.get((idx,data.clone())).unwrap_or(false), "data is already registered");
        //     self.is_registerd.insert((&idx,&data), &true);
        //     let mut data_list = self.indexes.get((idx,hash)).unwrap_or(Vec::<Vec<u8>>::new());
        //     data_list.push(data);
        //     self.indexes.insert((&idx, &hash), &data_list);
        // }

        #[ink(message)]
        pub fn add_data(&mut self, hash:u32, data:Vec<u8>) {
            assert!(!self.is_registerd.get(data.clone()).unwrap_or(false), "data is already registered");
            self.is_registerd.insert(&data, &true);
            let mut data_list = self.indexes.get(hash).unwrap_or(Vec::<Vec<u8>>::new());
            data_list.push(data);
            self.indexes.insert(&hash, &data_list);
        }
        
        #[ink(message)]
        pub fn get_data(&self, hash:u32) -> Vec<Vec<u8>> {
            self.indexes.get(hash).unwrap_or(Vec::<Vec<u8>>::new())
        }

        // #[ink(message)]
        // pub fn add_data_all(&mut self, idx:Vec<u8>, hash:Vec<u32>, data:Vec<u8>) {
        //     self.is_registerd.insert((&idx,&data), &true);
        //     let mut data_list = self.indexes.get((idx,hash)).unwrap_or(Vec::<Vec<u8>>::new());
        //     data_list.push(data);
        //     self.indexes.insert((&idx, &hash), &data_list);
        // }

        // #[ink(message)]
        // pub fn get_data(&self, idx:u8, hash:u32) -> Vec<Vec<u8>> {
        //     self.indexes.get((idx,hash)).unwrap_or(Vec::<Vec<u8>>::new())
        // }

        #[ink(message)]
        pub fn get_lsh_param(&self, idx:u8) -> Vec<u8> {
            self.lsh_params.get(idx).unwrap_or(Vec::<u8>::new())
        }

        #[ink(message)]
        pub fn get_all_lsh_param(&self) -> Vec<Vec<u8>> {
            let mut result = Vec::<Vec<u8>>::new();
            for i in 0..self.total_lsh {
                let tmp = self.lsh_params.get(i).unwrap_or(Vec::<u8>::new());
                result.push(tmp);
            }
            return result;
        }

        #[ink(message)]
        pub fn get_total_lsh(&self) -> u8 {
            self.total_lsh
        }

        #[ink(message)]
        pub fn register_lsh(&mut self, lsh_param: Vec<u8>) {
            assert!(lsh_param.len() > 0, "lsh_param length must be greater than 0");
            assert!(self.total_lsh!=255, "total_lsh must be less than 255");
            self.lsh_params.insert(&self.total_lsh, &lsh_param);
            self.total_lsh += 1;
        }
    }

    #[cfg(test)]
    mod tests {
        use super::*;

        #[ink::test]
        fn test() {
            let mut contract = LshIndex::new();
            assert_eq!(contract.get_total_lsh(), 0);

            // TEST: Register new lsh
            contract.register_lsh(vec![1,2,3]);
            assert_eq!(contract.get_total_lsh(), 1);
            contract.register_lsh(vec![10,20,30]);
            assert_eq!(contract.get_total_lsh(), 2);
            assert_eq!(contract.get_lsh_param(0), vec![1,2,3]);
            assert_eq!(contract.get_lsh_param(1), vec![10,20,30]);
            assert_eq!(contract.get_all_lsh_param(), vec![vec![1,2,3], vec![10,20,30]]);

            // TEST: Add data
            // assert_eq!(contract.get_data(0,0).len(), 0);
            // let s: String = String::from("hex");
            // let v: Vec<u8> = s.into_bytes();
            // contract.add_data(0, 0, v.clone());
            // assert_eq!(contract.get_data(0,0).len(), 1);
            // assert_eq!(contract.get_data(0,0)[0], v);
            // assert_eq!(String::from_utf8(contract.get_data(0,0)[0].clone()).unwrap(), "hex");
            
            assert_eq!(contract.get_data(0).len(), 0);
            let s: String = String::from("hex");
            let v: Vec<u8> = s.into_bytes();
            contract.add_data(0, v.clone());
            assert_eq!(contract.get_data(0).len(), 1);
            assert_eq!(contract.get_data(0)[0], v);
            assert_eq!(String::from_utf8(contract.get_data(0)[0].clone()).unwrap(), "hex");
        }
    }
}
