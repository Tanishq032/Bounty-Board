// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "forge-std/Test.sol";
import "../src/BountyBoard.sol";
import "../src/AgentRegistry.sol";
import "../src/VerifierRegistry.sol";
import "../src/Reputation.sol";

contract BountyBoardTest is Test {
    BountyBoard public board;
    AgentRegistry public agentRegistry;
    VerifierRegistry public verifierRegistry;
    Reputation public reputation;
    
    address poster = address(0x111);
    address bidderOwner = address(0x222);
    address payoutWallet = address(0x333);
    address operatorWallet = address(0x444);
    address newOperatorWallet = address(0x555);
    address nonOperator = address(0x666);
    
    event TaskCreated(uint256 indexed taskId, address indexed poster, uint96 reward);

    function setUp() public {
        reputation = new Reputation();
        agentRegistry = new AgentRegistry();
        verifierRegistry = new VerifierRegistry(1 ether);
        
        board = new BountyBoard(
            address(agentRegistry),
            address(verifierRegistry),
            address(reputation)
        );
        
        vm.deal(poster, 100 ether);
        vm.deal(operatorWallet, 100 ether);
        vm.deal(newOperatorWallet, 100 ether);
        vm.deal(nonOperator, 100 ether);
        vm.deal(bidderOwner, 100 ether);
    }

    function test_createTask() public {
        vm.startPrank(poster);
        
        uint64 biddingDeadline = uint64(block.timestamp + 1 days);
        uint64 executionDeadline = uint64(block.timestamp + 2 days);
        bytes32 dummyHash = keccak256("dummy");
        
        vm.expectEmit(true, true, false, true);
        emit TaskCreated(1, poster, 1 ether);
        
        uint256 taskId = board.createTask{value: 1 ether}(
            biddingDeadline,
            executionDeadline,
            BountyBoard.SelectionMode.Manual,
            dummyHash,
            dummyHash,
            dummyHash
        );
        
        assertEq(taskId, 1);
        vm.stopPrank();
    }
    
    function _setupAgentAndTask() internal returns (uint256 taskId, uint256 agentId) {
        vm.startPrank(bidderOwner);
        bytes32[] memory templates = new bytes32[](0);
        agentId = agentRegistry.registerAgent(payoutWallet, operatorWallet, keccak256("meta"), templates);
        vm.stopPrank();

        vm.startPrank(poster);
        taskId = board.createTask{value: 1 ether}(
            uint64(block.timestamp + 1 days),
            uint64(block.timestamp + 2 days),
            BountyBoard.SelectionMode.Manual,
            keccak256("crit"),
            keccak256("gold"),
            keccak256("in")
        );
        vm.stopPrank();
    }

    function test_nonOperatorCannotBid() public {
        (uint256 taskId, uint256 agentId) = _setupAgentAndTask();
        
        vm.startPrank(nonOperator);
        vm.expectRevert(BountyBoard.Unauthorized.selector);
        board.placeBid{value: 0.05 ether}(taskId, agentId, 0.5 ether, 3600);
        vm.stopPrank();
    }
    
    function test_operatorCanBid() public {
        (uint256 taskId, uint256 agentId) = _setupAgentAndTask();
        
        vm.startPrank(operatorWallet);
        board.placeBid{value: 0.05 ether}(taskId, agentId, 0.5 ether, 3600);
        vm.stopPrank();
        
        (uint256 aId, uint96 price, , , bool active) = board.taskBids(taskId, 0);
        assertEq(aId, agentId);
        assertEq(price, 0.5 ether);
        assertTrue(active);
    }
    
    function test_posterCannotBidOnOwnTask_asOwner() public {
        bytes32[] memory templates = new bytes32[](0);
        
        // Agent owned by poster
        vm.startPrank(poster);
        uint256 agentId = agentRegistry.registerAgent(payoutWallet, operatorWallet, keccak256("meta"), templates);
        
        uint256 taskId = board.createTask{value: 1 ether}(
            uint64(block.timestamp + 1 days),
            uint64(block.timestamp + 2 days),
            BountyBoard.SelectionMode.Manual,
            keccak256("crit"),
            keccak256("gold"),
            keccak256("in")
        );
        vm.stopPrank();

        vm.startPrank(operatorWallet);
        vm.expectRevert(BountyBoard.Unauthorized.selector);
        board.placeBid{value: 0.05 ether}(taskId, agentId, 0.5 ether, 3600);
        vm.stopPrank();
    }

    function test_posterCannotBidOnOwnTask_asOperator() public {
        bytes32[] memory templates = new bytes32[](0);
        
        // Agent where poster is operator
        vm.startPrank(bidderOwner);
        uint256 agentId = agentRegistry.registerAgent(payoutWallet, poster, keccak256("meta"), templates);
        vm.stopPrank();
        
        vm.startPrank(poster);
        uint256 taskId = board.createTask{value: 1 ether}(
            uint64(block.timestamp + 1 days),
            uint64(block.timestamp + 2 days),
            BountyBoard.SelectionMode.Manual,
            keccak256("crit"),
            keccak256("gold"),
            keccak256("in")
        );
        
        vm.expectRevert(BountyBoard.Unauthorized.selector);
        board.placeBid{value: 0.05 ether}(taskId, agentId, 0.5 ether, 3600);
        vm.stopPrank();
    }
    
    function test_pausedAgentCannotBid() public {
        (uint256 taskId, uint256 agentId) = _setupAgentAndTask();
        
        vm.prank(bidderOwner);
        bytes32[] memory templates = new bytes32[](0);
        agentRegistry.updateAgent(agentId, payoutWallet, operatorWallet, keccak256("meta"), templates, false);
        
        vm.startPrank(operatorWallet);
        vm.expectRevert("Agent not active");
        board.placeBid{value: 0.05 ether}(taskId, agentId, 0.5 ether, 3600);
        vm.stopPrank();
    }
    
    function test_ownerCanRotateOperator() public {
        (, uint256 agentId) = _setupAgentAndTask();
        
        vm.prank(bidderOwner);
        bytes32[] memory templates = new bytes32[](0);
        agentRegistry.updateAgent(agentId, payoutWallet, newOperatorWallet, keccak256("meta"), templates, true);
        
        AgentRegistry.Agent memory agent = agentRegistry.getAgent(agentId);
        assertEq(agent.operatorAddress, newOperatorWallet);
    }
    
    function test_nonOperatorCannotSubmitWork() public {
        (uint256 taskId, uint256 agentId) = _setupAgentAndTask();
        
        vm.startPrank(operatorWallet);
        board.placeBid{value: 0.05 ether}(taskId, agentId, 0.5 ether, 3600);
        vm.stopPrank();
        
        vm.prank(poster);
        board.selectWorker(taskId, 0);
        
        vm.startPrank(nonOperator);
        vm.expectRevert(BountyBoard.Unauthorized.selector);
        board.submitWork(taskId, keccak256("evidence"), "ipfs://evidence");
        vm.stopPrank();
    }
    
    function test_operatorCanSubmitWork() public {
        (uint256 taskId, uint256 agentId) = _setupAgentAndTask();
        
        vm.startPrank(operatorWallet);
        board.placeBid{value: 0.05 ether}(taskId, agentId, 0.5 ether, 3600);
        vm.stopPrank();
        
        vm.prank(poster);
        board.selectWorker(taskId, 0);
        
        vm.startPrank(operatorWallet);
        board.submitWork(taskId, keccak256("evidence"), "ipfs://evidence");
        vm.stopPrank();
        
        (, , , , , BountyBoard.Status status, , , , , , ,) = board.tasks(taskId);
        assertEq(uint(status), uint(BountyBoard.Status.Submitted));
    }
}
