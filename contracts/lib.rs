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
        current_num_of_lsh: u8,
        max_num_of_lsh: u8,
        vector_dim: u32
    }

    impl LshIndex {
        #[ink(constructor)]
        pub fn new(max_num_of_lsh:u8, vector_dim:u32) -> Self {
            Self { 
                indexes: Mapping::new(),
                is_registerd: Mapping::new(),
                lsh_params: Mapping::new(),
                current_num_of_lsh: 0,
                max_num_of_lsh: max_num_of_lsh,
                vector_dim: vector_dim
            }
        }

        #[ink(message)]
        pub fn add_data(&mut self, hash:u32, data:Vec<u8>) {
            assert!(self.current_num_of_lsh==self.max_num_of_lsh, "Plese add lsh param first");
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

        #[ink(message)]
        pub fn get_lsh_param(&self, idx:u8) -> Vec<u8> {
            self.lsh_params.get(idx).unwrap_or(Vec::<u8>::new())
        }

        #[ink(message)]
        pub fn get_current_num_of_lsh(&self) -> u8 {
            self.current_num_of_lsh
        }

        #[ink(message)]
        pub fn get_max_num_of_lsh(&self) -> u8 {
            self.max_num_of_lsh
        }

        #[ink(message)]
        pub fn get_vector_dim(&self) -> u32 {
            self.vector_dim
        }

        #[ink(message)]
        pub fn register_lsh(&mut self, lsh_param: Vec<u8>) {
            assert!(self.current_num_of_lsh!=self.max_num_of_lsh, "lsh_param cannot be registered anymore");
            self.lsh_params.insert(&self.current_num_of_lsh, &lsh_param);
            self.current_num_of_lsh += 1;
        }
    }

    #[cfg(test)]
    mod tests {
        use super::*;

        #[ink::test]
        fn test() {
            let mut contract = LshIndex::new(2,3);
            assert_eq!(contract.get_current_num_of_lsh(), 0);

            // TEST: Register new lsh
            contract.register_lsh(vec![1,2,3]);
            assert_eq!(contract.get_current_num_of_lsh(), 1);
            contract.register_lsh(vec![10,20,30]);
            assert_eq!(contract.get_current_num_of_lsh(), 2);
            assert_eq!(contract.get_lsh_param(0), vec![1,2,3]);
            assert_eq!(contract.get_lsh_param(1), vec![10,20,30]);
            
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
