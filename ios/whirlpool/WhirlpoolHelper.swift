//
//  WhirlpoolHelper.swift
//  hexa_keeper
//
//  Created by Praneeth G on 13/03/23.
//

import Foundation

@objc class WhirlpoolHelper: NSObject{
  override init() {
      super.init()
    }
  
  @objc func hello(name: String, callback: @escaping ((String) -> Void)) {
    let result = hello_world(name)
    let str =  String(cString: result!)
    free_cstring(UnsafeMutablePointer(mutating: result))
    callback(str)
  }

  @objc func initiateClient(port: String, callback: @escaping ((String)-> Void)){
    let result = initiate(port)
    let str =  String(cString: result!)
    free_cstring(UnsafeMutablePointer(mutating: result))
    callback(str)
  }

  @objc func getPools(port: String, callback: @escaping ((String)-> Void)){
    let result = pools(port)
    let str =  String(cString: result!)
    free_cstring(UnsafeMutablePointer(mutating: result))
    callback(str)
  }
  
  @objc func getTx0Data(scode: String, port: String, callback: @escaping ((String)-> Void)){
    let result = gettx0data(scode, port)
    let str =  String(cString: result!)
    free_cstring(UnsafeMutablePointer(mutating: result))
    callback(str)
  }
  
  @objc func tx0Preview(inputs_value: String, pool_str: String, fees_address: String, input_structure_str: String, miner_fee_per_byte: String, coordinator_fee: String, n_wanted_max_outputs_str: String, n_pool_max_outputs: String, premix_fee_per_byte: String, callback: @escaping ((String) -> Void)){
    let result = tx0_preview(inputs_value, pool_str, fees_address, input_structure_str, miner_fee_per_byte, coordinator_fee, n_wanted_max_outputs_str, n_pool_max_outputs, premix_fee_per_byte)
    let str =  String(cString: result!)
    free_cstring(UnsafeMutablePointer(mutating: result))
    callback(str)
  }
  
  @objc func intoPsbt(preview_str:String, tx0_data_str:String, inputs_str:String, address_bank_str:String, change_addr_str:String, callback: @escaping ((String)-> Void)){
    let result = into_psbt(preview_str, tx0_data_str, inputs_str, address_bank_str, change_addr_str)
    let str =  String(cString: result!)
    free_cstring(UnsafeMutablePointer(mutating: result))
    callback(str)
  }
  
  @objc func tx0push(tx_str:String, pool_id_str:String, port: String, callback: @escaping ((String)-> Void)){
    let result = tx0_push(tx_str, pool_id_str, port)
    let str =  String(cString: result!)
    free_cstring(UnsafeMutablePointer(mutating: result))
    callback(str)
  }
  
  @objc func blocking(input_str: String, private_key_str: String, destination_addr_str: String, pool_id: String, denomination_str: String, pre_user_hash_str: String, network_str: String, block_height_str: String, signedRegistrationMessage: String, app_id: String, port: String, callback: @escaping ((String) -> Void)){
    let result = start(input_str, private_key_str, destination_addr_str, pool_id, denomination_str, pre_user_hash_str, network_str, block_height_str, signedRegistrationMessage, app_id, port)
    let str =  String(cString: result!)
    free_cstring(UnsafeMutablePointer(mutating: result))
    callback(str)
  }
  
  @objc func estimateTx0Size(n_p2pkh_inputs:String, n_p2sh_p2wpkh_inputs:String, n_p2wpkh_inputs: String, n_p2wpkh_outputs:String, callback: @escaping ((String)-> Void)){
    let result = estimate_tx0_size(n_p2pkh_inputs, n_p2sh_p2wpkh_inputs, n_p2wpkh_inputs, n_p2wpkh_outputs)
    let str =  String(cString: result!)
    free_cstring(UnsafeMutablePointer(mutating: result))
    callback(str)
  }
}

