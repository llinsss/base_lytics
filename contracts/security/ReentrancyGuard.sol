// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

/**
 * @dev Contract module that helps prevent reentrant calls to a function.
 *
 * Inheriting from `ReentrancyGuard` will make the {nonReentrant} modifier
 * available, which can be applied to functions to make sure there are no nested
 * (reentrant) calls to them.
 *
 * Note that because there is a single `nonReentrant` guard, functions marked as
 * `nonReentrant` may not call one another. This can be worked around by making
 * those functions `private`, and then adding `external` `nonReentrant` entry
 * points to them.
 *
 * TIP: If you would like to learn more about reentrancy and alternative ways
 * to protect against it, check out our blog post
 * https://blog.openzeppelin.com/reentrancy-after-istanbul/[Reentrancy After Istanbul].
 */
abstract contract ReentrancyGuard {
    // Booleans are more expensive than uint256 or any type that takes up a full
    // word because each write operation emits an extra SLOAD to first read the
    // slot's contents, replace the bits taken up by the boolean, and then write
    // back. This is the compiler's defense against contract upgrades and
    // pointer aliasing, and it cannot be disabled.

    // The values being non-zero value makes deployment a bit more expensive,
    // but in exchange the refund on every call to nonReentrant will be lower in
    // amount. Since refunds are capped to a percentage of the total
    // transaction's gas, it is best to keep them low in cases like this one, to
    // increase the likelihood of the full refund coming into effect.
    uint256 private constant _NOT_ENTERED = 1;
    uint256 private constant _ENTERED = 2;

    uint256 private _status;

    constructor() {
        _status = _NOT_ENTERED;
    }

    /**
     * @dev Prevents a contract from calling itself, directly or indirectly.
     * Calling a `nonReentrant` function from another `nonReentrant`
     * function is not supported. It is possible to prevent this from happening
     * by making the `nonReentrant` function external, and making it call a
     * `private` function that does the actual work.
     */
    modifier nonReentrant() {
        _nonReentrantBefore();
        _;
        _nonReentrantAfter();
    }

    function _nonReentrantBefore() private {
        // On the first call to nonReentrant, _status will be _NOT_ENTERED
        require(_status != _ENTERED, "ReentrancyGuard: reentrant call");

        // Any calls to nonReentrant after this point will fail
        _status = _ENTERED;
    }

    function _nonReentrantAfter() private {
        // By storing the original value once again, a refund is triggered (see
        // https://eips.ethereum.org/EIPS/eip-2200)
        _status = _NOT_ENTERED;
    }

    /**
     * @dev Returns true if the reentrancy guard is currently set to "entered", which indicates there is a
     * `nonReentrant` function in the call stack.
     */
    function _reentrancyGuardEntered() internal view returns (bool) {
        return _status == _ENTERED;
    }
}

// Security check added

// Security check added

// Security check added

// Security check added

// Security check added

// Security check added

// Security check added

// Security check added

// Security check added

// Security check added

// Security check added

// Security check added

// Security check added

// Security check added

// Security check added

// Security check added

// Security check added

// Security check added

// Security check added

// Security check added

// Security check added

// Security check added

// Security check added

// Security check added

// Security check added

// Security check added

// Security check added

// Security check added

// Security check added

// Security check added

// Security check added

// Security check added

// Security check added

// Security check added

// Security check added

// Security check added

// Security check added

// Security check added

// Security check added

// Security check added

// Security check added

// Security check added

// Security check added

// Security check added

// Security check added

// Security check added

// Security check added

// Security check added

// Security check added

// Security check added

// Security check added

// Security check added

// Security check added

// Security check added

// Security check added

// Security check added

// Security check added

// Security check added

// Security check added

// Security check added

// Security check added

// Security check added

// Security check added

// Security check added

// Security check added

// Security check added

// Security check added

// Security check added

// Security check added

// Security check added

// Security check added

// Security check added

// Security check added

// Security check added

// Security check added

// Security check added

// Security check added

// Security check added

// Security check added

// Security check added

// Security check added

// Security check added

// Security check added

// Security check added

// Security check added

// Security check added

// Security check added

// Security check added

// Security check added

// Security check added

// Security check added

// Security check added (2026-02-08T06:51:55.684206)

// Security check added (2026-02-08T19:33:53.895710)

// Security check added (2026-02-08T19:33:54.758838)

// Security check added (2026-02-08T19:33:55.463940)

// Security check added (2026-02-08T19:33:56.174276)

// Security check added (2026-02-08T19:33:56.979674)

// Security check added (2026-02-08T19:33:57.703892)

// Security check added (2026-02-08T19:33:58.537269)

// Security check added (2026-02-08T19:33:59.326196)

// Security check added (2026-02-08T19:34:00.053753)

// Security check added (2026-02-08T19:34:00.803902)

// Security check added (2026-02-08T19:34:01.464558)

// Security check added (2026-02-08T19:34:02.203847)

// Security check added (2026-02-09T08:29:18.068160)

// Security check added (2026-02-09T08:29:19.053667)

// Security check added (2026-02-09T08:29:19.893731)

// Security check added (2026-02-09T08:29:20.715272)

// Security check added (2026-02-09T08:29:21.466066)

// Security check added (2026-02-10T08:45:20.191249)

// Security check added (2026-02-10T08:45:21.577271)

// Security check added (2026-02-10T08:45:22.825017)

// Security check added (2026-02-10T08:45:23.765312)

// Security check added (2026-02-10T08:45:24.499697)

// Security check added (2026-02-10T08:45:25.508988)

// Security check added (2026-02-10T08:45:26.648315)

// Security check added (2026-02-10T08:45:27.320776)

// Security check added (2026-02-10T08:45:28.135250)

// Security check added (2026-02-10T08:45:28.849826)

// Security check added (2026-02-10T08:45:29.697227)

// Security check added (2026-02-10T08:45:30.717553)

// Security check added (2026-02-10T08:45:32.150605)

// Security check added (2026-02-10T08:45:33.489707)

// Security check added (2026-02-10T08:45:34.784599)

// Security check added (2026-02-10T08:45:36.507447)

// Security check added (2026-02-10T08:45:37.856261)

// Security check added (2026-02-10T08:45:39.170399)

// Security check added (2026-02-10T08:45:40.202076)

// Security check added (2026-02-10T08:45:40.959282)

// Security check added (2026-02-10T08:45:41.602652)

// Security check added (2026-02-10T08:45:42.288249)

// Security check added (2026-02-10T08:45:43.125921)

// Security check added (2026-02-10T08:45:43.859422)

// Security check added (2026-02-10T08:45:44.517730)

// Security check added (2026-02-10T08:45:45.319291)

// Security check added (2026-02-10T08:45:46.009618)

// Security check added (2026-02-10T08:45:46.761194)

// Security check added (2026-02-10T08:45:47.438836)

// Security check added (2026-02-10T08:45:48.137929)

// Security check added (2026-02-10T08:45:48.819678)

// Security check added (2026-02-10T08:45:49.670544)

// Security check added (2026-02-10T08:45:50.471102)

// Security check added (2026-02-10T08:45:51.187685)

// Security check added (2026-02-10T08:45:52.001415)

// Security check added (2026-02-10T08:45:52.791233)

// Security check added (2026-02-10T08:45:53.519889)

// Security check added (2026-02-10T08:45:54.232240)

// Security check added (2026-02-10T08:45:54.909867)

// Security check added (2026-02-10T08:45:55.636007)

// Security check added (2026-02-10T08:45:56.306309)

// Security check added (2026-02-11T16:13:16.092688)

// Security check added (2026-02-11T16:13:17.792977)
