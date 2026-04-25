import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import AvatarUploader from '../AvatarUploader';
import axios from 'axios';
import { useAuth } from '@clerk/nextjs';

// Mock external dependencies
jest.mock('axios');
jest.mock('@clerk/nextjs', () => ({
  useAuth: jest.fn()
}));

const mockAxiosPost = axios.post as jest.Mock;
const mockUseAuth = useAuth as jest.Mock;

describe('AvatarUploader Component Tests', () => {
  const mockOnUpload = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    mockUseAuth.mockReturnValue({
      getToken: jest.fn().mockResolvedValue('fake-token')
    });
  });

  it('should render the default avatar and upload button initially', () => {
    render(<AvatarUploader onUpload={mockOnUpload} />);
    
    const image = screen.getByAltText('Avatar');
    expect(image).toHaveAttribute('src', '/default-avatar.png');
    expect(screen.getByText('Change Avatar')).toBeInTheDocument();
  });

  it('should render the provided currentUrl if given', () => {
    const customUrl = 'https://example.com/my-pic.jpg';
    render(<AvatarUploader currentUrl={customUrl} onUpload={mockOnUpload} />);
    
    const image = screen.getByAltText('Avatar');
    expect(image).toHaveAttribute('src', customUrl);
  });

  it('should simulate a file upload and call onUpload successfully', async () => {
    // 1. Arrange: Tell axios to pretend the API call was successful
    mockAxiosPost.mockResolvedValueOnce({
      data: { avatarUrl: 'https://cdn.example.com/new-avatar.png' }
    });

    render(<AvatarUploader onUpload={mockOnUpload} />);
    
    // 2. Act: Simulate selecting a file in the input
    const file = new File(['dummy content'], 'avatar.png', { type: 'image/png' });
    
    // We can find the input by finding the label text first
    const inputElement = screen.getByLabelText('Change Avatar');
    fireEvent.change(inputElement, { target: { files: [file] } });

    // Assert the button changes to the loading state
    expect(screen.getByText('Uploading…')).toBeInTheDocument();

    // 3. Assert: Wait for the mock async functions to be called
    await waitFor(() => {
      expect(mockOnUpload).toHaveBeenCalledWith('https://cdn.example.com/new-avatar.png');
    });
    
    // Verify our token was passed to axios.post
    expect(mockAxiosPost).toHaveBeenCalledTimes(1);
    expect(mockAxiosPost).toHaveBeenCalledWith(
        '/api/users/avatar', 
        expect.any(FormData), 
        expect.objectContaining({ headers: { Authorization: 'Bearer fake-token' } })
    );

    // Verify it changed back after success
    expect(screen.getByText('Change Avatar')).toBeInTheDocument();
  });
});
