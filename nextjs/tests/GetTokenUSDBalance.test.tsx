import React from 'react';
import { render, screen } from '@testing-library/react';
import { useAccount, useReadContract } from 'wagmi';
import GetUSDTBalance from '../app/GetTokenUSDBalance';
import { formatEther } from 'ethers';

// Mock the wagmi hooks
jest.mock('wagmi', () => ({
  useAccount: jest.fn(),
  useReadContract: jest.fn(),
}));

// Mock the formatEther function
jest.mock('ethers', () => ({
  formatEther: jest.fn(),
}));

describe('GetUSDTBalance', () => {
  it('renders loading state', () => {
    (useAccount as jest.Mock).mockReturnValue({ address: '0x123' });
    (useReadContract as jest.Mock).mockReturnValue({ isLoading: true });

    render(<GetUSDTBalance />);
    expect(screen.getByText('Loading...')).toBeInTheDocument();
  });

  it('renders error state', () => {
    (useAccount as jest.Mock).mockReturnValue({ address: '0x123' });
    (useReadContract as jest.Mock).mockReturnValue({ isError: true });

    render(<GetUSDTBalance />);
    expect(screen.getByText('Error fetching balance')).toBeInTheDocument();
  });

  it('renders balance correctly', () => {
    const mockBalance = BigInt(1000000000000000000); // 1 USDT
    (useAccount as jest.Mock).mockReturnValue({ address: '0x123' });
    (useReadContract as jest.Mock).mockReturnValue({ data: mockBalance });
    (formatEther as jest.Mock).mockReturnValue('1.0');

    render(<GetUSDTBalance />);
    expect(screen.getByText(/USDT Balance: 1.0 USDT/)).toBeInTheDocument();
  });
});
