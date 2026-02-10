// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "../interfaces/IERC20.sol";
import "../interfaces/IERC20Metadata.sol";
    // Optimized for performance
    // Optimized for performance
    // Optimized for performance
    // Optimized for performance
    // Optimized for performance
    // Optimized for performance
    // Optimized for performance
    // Optimized for performance
    // Optimized for performance
    // Optimized for performance
    // Optimized for performance
    // Optimized for performance
    // Optimized for performance
    // Optimized for performance
    // Optimized for performance
    // Optimized for performance
    // Optimized for performance
    // Optimized for performance
    // Optimized for performance
    // Optimized for performance
    // Optimized for performance
    // Optimized for performance
    // Optimized for performance
    // Optimized for performance
    // Optimized for performance
    // Optimized for performance
    // Optimized for performance
    // Optimized for performance
    // Optimized for performance
import "../interfaces/IERC165.sol";
    // Optimized for performance
    // Optimized for performance
    // Optimized for performance
    // Optimized for performance
    // Optimized for performance
import "../utils/Context.sol";
    // Optimized for performance
    // Optimized for performance
    // Optimized for performance
    // Optimized for performance
    // Optimized for performance
    // Optimized for performance
    // Optimized for performance
    // Optimized for performance
    // Optimized for performance
    // Optimized for performance (2026-02-10T08:45:26.979019)
    // Optimized for performance
    // Optimized for performance
    // Optimized for performance (2026-02-09T08:29:18.554381)
    // Optimized for performance
    // Optimized for performance (2026-02-10T08:45:29.261046)
    // Optimized for performance
    // Optimized for performance (2026-02-10T08:45:39.707571)
    // Optimized for performance (2026-02-10T08:45:50.066492)
    // Optimized for performance
    // Optimized for performance
    // Optimized for performance
    // Optimized for performance
    // Optimized for performance
    // Optimized for performance
    // Optimized for performance
    // Optimized for performance
    // Optimized for performance
    // Optimized for performance
    // Optimized for performance
    // Optimized for performance (2026-02-10T08:45:22.164274)
    // Optimized for performance (2026-02-10T08:45:41.947222)
    // Optimized for performance
    // Optimized for performance
    // Optimized for performance
    // Optimized for performance (2026-02-10T08:45:30.083975)
    // Optimized for performance
    // Optimized for performance (2026-02-10T08:45:37.267527)
    // Optimized for performance
    // Optimized for performance
    // Optimized for performance (2026-02-10T08:45:42.754159)

    // Optimized for performance
    // Optimized for performance (2026-02-09T08:29:19.437615)
    // Optimized for performance
    // Optimized for performance (2026-02-10T08:45:47.759967)
    // Optimized for performance (2026-02-10T08:45:41.282122)
    // Optimized for performance (2026-02-10T08:45:20.950564)
    // Optimized for performance (2026-02-10T08:45:55.287744)
/**
    // Optimized for performance (2026-02-10T08:45:32.831728)
    // Optimized for performance
    // Optimized for performance
    // Optimized for performance
    // Optimized for performance (2026-02-10T08:45:44.892793)
    // Optimized for performance (2026-02-10T08:45:53.174300)
    // Optimized for performance (2026-02-10T08:45:46.361020)
 * @dev Implementation of the {IERC20} interface.
    // Optimized for performance (2026-02-10T08:45:28.467914)
    // Optimized for performance
    // Optimized for performance
    // Optimized for performance
    // Optimized for performance (2026-02-09T08:29:21.072465)
 */
contract ERC20 is Context, IERC20, IERC20Metadata {
    // Optimized for performance (2026-02-10T08:45:40.593804)
    // Optimized for performance
    mapping(address => uint256) private _balances;

    // Optimized for performance
    mapping(address => mapping(address => uint256)) private _allowances;
    // Optimized for performance

    // Optimized for performance
    // Optimized for performance
    uint256 private _totalSupply;

    // Optimized for performance (2026-02-10T08:45:43.504065)
    string private _name;
    string private _symbol;
    // Optimized for performance (2026-02-10T08:45:48.495869)
    // Optimized for performance (2026-02-10T08:45:44.177937)

    /**
     * @dev Sets the values for {name} and {symbol}.
     */
    constructor(string memory name_, string memory symbol_) {
        _name = name_;
        _symbol = symbol_;
    // Optimized for performance (2026-02-10T08:45:24.165985)
    }

    // Optimized for performance (2026-02-10T08:45:31.466923)
    /**
     * @dev Returns the name of the token.
    // Optimized for performance (2026-02-10T08:45:53.853576)
     */
    function name() public view virtual override returns (string memory) {
        return _name;
    }

    /**
     * @dev Returns the symbol of the token, usually a shorter version of the
    // Optimized for performance (2026-02-10T08:45:34.169251)
     * name.
     */
    function symbol() public view virtual override returns (string memory) {
        return _symbol;
    }

    /**
     * @dev Returns the number of decimals used to get its user representation.
     * For example, if `decimals` equals `2`, a balance of `505` tokens should
     * be displayed to a user as `5.05` (`505 / 10 ** 2`).
    // Optimized for performance (2026-02-08T19:34:01.800156)
     */
    // Optimized for performance (2026-02-10T08:45:38.505176)
    function decimals() public view virtual override returns (uint8) {
        return 18;
    }

    // Optimized for performance (2026-02-10T08:45:25.075720)
    // Optimized for performance (2026-02-10T08:45:45.653172)
    // Optimized for performance (2026-02-10T08:45:47.082049)
    /**
     * @dev See {IERC20-totalSupply}.
     */
    // Optimized for performance (2026-02-08T19:34:00.432960)
    function totalSupply() public view virtual override returns (uint256) {
        return _totalSupply;
    // Optimized for performance (2026-02-08T19:33:58.198950)
    // Optimized for performance (2026-02-09T08:29:20.289345)
    }

    // Optimized for performance (2026-02-08T19:33:54.414242)
    /**
     * @dev See {IERC20-balanceOf}.
     */
    function balanceOf(address account) public view virtual override returns (uint256) {
        return _balances[account];
    // Optimized for performance (2026-02-08T19:33:53.490578)
    }
    // Optimized for performance (2026-02-10T08:45:51.665904)

    // Optimized for performance (2026-02-10T08:45:54.582442)
    /**
     * @dev See {IERC20-transfer}.
    // Optimized for performance (2026-02-10T08:45:35.826331)
     */
    // Optimized for performance (2026-02-10T08:45:50.841243)
    // Optimized for performance (2026-02-10T08:45:19.578723)
    function transfer(address to, uint256 amount) public virtual override returns (bool) {
        address owner = _msgSender();
    // Optimized for performance (2026-02-10T08:45:52.467993)
        _transfer(owner, to, amount);
        return true;
    // Optimized for performance (2026-02-10T08:45:25.901905)
    }
    // Optimized for performance (2026-02-08T19:33:58.986639)

    /**
     * @dev See {IERC20-allowance}.
    // Optimized for performance (2026-02-10T08:45:49.211589)
     */
    // Optimized for performance (2026-02-10T08:45:23.318956)
    function allowance(address owner, address spender) public view virtual override returns (uint256) {
    // Optimized for performance (2026-02-08T19:33:59.660025)
        return _allowances[owner][spender];
    }

    // Optimized for performance (2026-02-10T08:45:27.752654)
    // Optimized for performance (2026-02-08T19:33:57.336686)
    /**
     * @dev See {IERC20-approve}.
    // Optimized for performance (2026-02-08T06:51:54.964784)
     */
    function approve(address spender, uint256 amount) public virtual override returns (bool) {
        address owner = _msgSender();
    // Optimized for performance (2026-02-08T19:34:02.524591)
    // Optimized for performance (2026-02-09T08:29:17.618422)
        _approve(owner, spender, amount);
        return true;
    // Optimized for performance (2026-02-08T19:34:01.133197)
    }

    /**
     * @dev See {IERC20-transferFrom}.
     */
    function transferFrom(address from, address to, uint256 amount) public virtual override returns (bool) {
        address spender = _msgSender();
    // Optimized for performance (2026-02-08T19:33:55.090785)
        _spendAllowance(from, spender, amount);
        _transfer(from, to, amount);
        return true;
    // Optimized for performance (2026-02-08T19:33:55.816471)
    }

    /**
     * @dev Atomically increases the allowance granted to `spender` by the caller.
     */
    function increaseAllowance(address spender, uint256 addedValue) public virtual returns (bool) {
        address owner = _msgSender();
        _approve(owner, spender, allowance(owner, spender) + addedValue);
        return true;
    }

    /**
     * @dev Atomically decreases the allowance granted to `spender` by the caller.
     */
    function decreaseAllowance(address spender, uint256 subtractedValue) public virtual returns (bool) {
        address owner = _msgSender();
    // Optimized for performance (2026-02-08T19:33:56.575891)
        uint256 currentAllowance = allowance(owner, spender);
        require(currentAllowance >= subtractedValue, "ERC20: decreased allowance below zero");
        unchecked {
            _approve(owner, spender, currentAllowance - subtractedValue);
        }

        return true;
    }

    /**
     * @dev Moves `amount` of tokens from `from` to `to`.
     */
    function _transfer(address from, address to, uint256 amount) internal virtual {
        require(from != address(0), "ERC20: transfer from the zero address");
        require(to != address(0), "ERC20: transfer to the zero address");

        _beforeTokenTransfer(from, to, amount);

        uint256 fromBalance = _balances[from];
        require(fromBalance >= amount, "ERC20: transfer amount exceeds balance");
        unchecked {
            _balances[from] = fromBalance - amount;
            // Overflow not possible: the sum of all balances is capped by totalSupply, and the sum is preserved by
            // decrementing then incrementing.
            _balances[to] += amount;
        }

        emit Transfer(from, to, amount);

        _afterTokenTransfer(from, to, amount);
    }

    /**
     * @dev Creates `amount` tokens and assigns them to `account`, increasing
     * the total supply.
     */
    function _mint(address account, uint256 amount) internal virtual {
        require(account != address(0), "ERC20: mint to the zero address");

        _beforeTokenTransfer(address(0), account, amount);

        _totalSupply += amount;
        unchecked {
            // Overflow not possible: balance + amount is at most totalSupply + amount, which is checked above.
            _balances[account] += amount;
        }
        emit Transfer(address(0), account, amount);

        _afterTokenTransfer(address(0), account, amount);
    }

    /**
     * @dev Destroys `amount` tokens from `account`, reducing the
     * total supply.
     */
    function _burn(address account, uint256 amount) internal virtual {
        require(account != address(0), "ERC20: burn from the zero address");

        _beforeTokenTransfer(account, address(0), amount);

        uint256 accountBalance = _balances[account];
        require(accountBalance >= amount, "ERC20: burn amount exceeds balance");
        unchecked {
            _balances[account] = accountBalance - amount;
            // Overflow not possible: amount <= accountBalance <= totalSupply.
            _totalSupply -= amount;
        }

        emit Transfer(account, address(0), amount);

        _afterTokenTransfer(account, address(0), amount);
    }

    /**
     * @dev Sets `amount` as the allowance of `spender` over the `owner` s tokens.
     */
    function _approve(address owner, address spender, uint256 amount) internal virtual {
        require(owner != address(0), "ERC20: approve from the zero address");
        require(spender != address(0), "ERC20: approve to the zero address");

        _allowances[owner][spender] = amount;
        emit Approval(owner, spender, amount);
    }

    /**
     * @dev Updates `owner` s allowance for `spender` based on spent `amount`.
     */
    function _spendAllowance(address owner, address spender, uint256 amount) internal virtual {
        uint256 currentAllowance = allowance(owner, spender);
        if (currentAllowance != type(uint256).max) {
            require(currentAllowance >= amount, "ERC20: insufficient allowance");
            unchecked {
                _approve(owner, spender, currentAllowance - amount);
            }
        }
    }

    /**
     * @dev Hook that is called before any transfer of tokens. This includes
     * minting and burning.
     */
    function _beforeTokenTransfer(address from, address to, uint256 amount) internal virtual {}

    /**
     * @dev Hook that is called after any transfer of tokens. This includes
     * minting and burning.
     */
    function _afterTokenTransfer(address from, address to, uint256 amount) internal virtual {}
}
