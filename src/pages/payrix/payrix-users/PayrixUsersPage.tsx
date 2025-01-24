import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Table } from 'antd';
import type { ColumnsType } from 'antd/es/table';

interface PayrixMerchant {
  id: string;
  name: string;
  email: string;
  phone: string;
  address1: string;
  city: string;
  state: string;
  zip: string;
  country: string;
  created: string;
  status: 'active' | 'inactive' | 'frozen';
  inactive: number;
  frozen: number;
}

interface PayrixErrorResponse {
  response: {
    errors: Array<{
      code: number;
      severity: number;
      msg: string;
      errorCode: string;
    }>;
  };
}

const PayrixUsersPage = () => {
  const [loading, setLoading] = useState(false);
  const [merchants, setMerchants] = useState<PayrixMerchant[]>([]);
  const [error, setError] = useState<string | null>(null);

  const handleDelete = async (merchantId: string) => {
    try {
      setLoading(true);
      await axios.delete(
        `${import.meta.env.VITE_SERVERLESS_API_URL}/payrix/merchants/${merchantId}`
      );
      await fetchMerchants();
    } catch (err) {
      if (axios.isAxiosError(err) && err.response?.data) {
        const payrixError = err.response.data as PayrixErrorResponse;
        const errorMessage = payrixError.response.errors?.[0]?.msg || 'Failed to delete merchant';
        setError(`${errorMessage}. Please try again later.`);
      } else {
        setError('Failed to delete merchant. Please try again later.');
      }
      console.error('Error deleting merchant:', err);
    } finally {
      setLoading(false);
    }
  };

  const columns: ColumnsType<PayrixMerchant> = [
    {
      title: 'Name',
      dataIndex: 'name',
      key: 'name',
      sorter: (a, b) => a.name.localeCompare(b.name),
      className: 'text-gray-900 font-medium'
    },
    {
      title: 'Email',
      dataIndex: 'email',
      key: 'email',
      className: 'text-gray-600',
      sorter: (a, b) => a.email.localeCompare(b.email)
    },
    {
      title: 'Phone',
      dataIndex: 'phone',
      key: 'phone',
      render: (phone: string) => {
        return phone ? (
          <span className="text-gray-600">{formatPhoneNumber(phone)}</span>
        ) : (
          <span className="text-gray-400">-</span>
        );
      }
    },
    {
      title: 'Location',
      key: 'location',
      render: (_, record) => (
        <span className="text-gray-600">
          {record.city}, {record.state} {record.zip}
        </span>
      )
    },
    {
      title: 'Status',
      key: 'status',
      render: (_, record) => {
        const status = getStatus(record);
        return (
          <span
            className={`
              inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium
              ${status === 'active' && 'bg-green-100 text-green-800'} 
              ${status === 'inactive' && 'bg-yellow-100 text-yellow-800'}
              ${status === 'frozen' && 'bg-red-100 text-red-800'}
            `}
          >
            {status}
          </span>
        );
      }
    },
    {
      title: 'Created',
      dataIndex: 'created',
      key: 'created',
      render: (date: string) => (
        <span className="text-gray-600">{new Date(date).toLocaleDateString()}</span>
      )
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_, record) => (
        <button
          className="
            px-3 py-1.5 
            text-sm font-medium
            text-red-700 hover:text-red-800
            bg-red-50 hover:bg-red-100
            border border-transparent
            rounded-md
            transition-colors duration-200
            focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500
          "
          onClick={() => {
            if (window.confirm('Are you sure you want to delete this merchant?')) {
              handleDelete(record.id);
            }
          }}
        >
          Delete
        </button>
      )
    }
  ];

  const formatPhoneNumber = (phone: string): string => {
    const cleaned = phone.replace(/\D/g, '');
    const match = cleaned.match(/^(\d{3})(\d{3})(\d{4})$/);
    if (match) {
      return '(' + match[1] + ') ' + match[2] + '-' + match[3];
    }
    return phone;
  };

  const getStatus = (merchant: PayrixMerchant): string => {
    if (merchant.frozen === 1) return 'frozen';
    if (merchant.inactive === 1) return 'inactive';
    return 'active';
  };

  const getStatusColor = (status: string): string => {
    switch (status) {
      case 'active':
        return 'success';
      case 'inactive':
        return 'warning';
      case 'frozen':
        return 'danger';
      default:
        return 'primary';
    }
  };

  const fetchMerchants = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await axios.get(
        `${import.meta.env.VITE_SERVERLESS_API_URL}/payrix/merchants`
      );

      console.log('%c check', 'color: red; font-weight: bold;', response?.data?.data.response.data);

      const formattedMerchants = response?.data?.data?.response?.data?.map((merchant: any) => ({
        id: merchant.id,
        name: merchant.name,
        email: merchant.email,
        phone: merchant.phone,
        address1: merchant.address1,
        city: merchant.city,
        state: merchant.state,
        zip: merchant.zip,
        country: merchant.country,
        created: merchant.created,
        inactive: merchant.inactive,
        frozen: merchant.frozen
      }));

      setMerchants(formattedMerchants);
    } catch (err) {
      setError('Failed to fetch merchants. Please try again later.');
      console.error('Error fetching merchants:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMerchants();
  }, []);

  if (error) {
    return (
      <div className="alert alert-danger">
        <div className="d-flex flex-column">
          <h4 className="mb-1">Error</h4>
          <span>{error}</span>
        </div>
      </div>
    );
  }

  return (
    <div className="card">
      <div className="card-header border-0 pt-6">
        <div className="card-title">
          <h3>Payrix Merchants</h3>
        </div>
      </div>
      <div className="card-body py-4">
        <Table
          columns={columns}
          dataSource={merchants}
          rowKey="id"
          loading={loading}
          pagination={{
            defaultPageSize: 10,
            showSizeChanger: true,
            showTotal: (total) => `Total ${total} merchants`
          }}
        />
      </div>
    </div>
  );
};

export default PayrixUsersPage;
