import { Component } from 'react';

class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, info) {
    console.error('Section crashed:', this.props.name, error, info);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="py-10 text-center text-red-500 bg-red-50 dark:bg-red-900/10">
          <p className="font-medium">Section "{this.props.name}" failed to render.</p>
          <p className="text-sm mt-1 text-red-400">{this.state.error?.message}</p>
        </div>
      );
    }
    return this.props.children;
  }
}

export default ErrorBoundary;
