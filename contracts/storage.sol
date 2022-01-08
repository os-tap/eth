// SPDX-License-Identifier: UNLICENSED
pragma solidity >=0.7.0 <0.9.0;

contract Storage {
    
	mapping (address => bytes) public data;

    function store(bytes memory _data) external {
        data[msg.sender] = _data;
    }
}