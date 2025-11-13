export interface statusCounting{
    all: number,
    pending: number,
    done: number,
    failed: number
}
export interface Transaction {
  transaction_id: string;
  renting_id: string;
  lessee_id: string;
  lessor_id: string;
  amount: number;
  status: 'Pending' | 'Done' | 'Failed';
  transaction_date: string;
  renting: {
    sdate: string;
    edate: string;
    status: string;
    car_information: {
      car_brand: string;
      model: string;
      year_created: number;
      car_image: string;
    };
  };
  lessee_info: {
    u_firstname: string;
    u_lastname: string;
  };
  lessor_info: {
    u_firstname: string;
    u_lastname: string;
  };
}