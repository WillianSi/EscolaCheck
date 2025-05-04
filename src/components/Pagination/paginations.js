import { FaChevronLeft, FaChevronRight } from "react-icons/fa";
import React from "react";
import { Pagination, PaginationItem, PaginationLink } from "reactstrap";

const Paginations = ({ itemsPerPage, totalItems, currentPage, onPageChange }) => {
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const pageNumbers = [];

  for (let i = Math.max(1, currentPage - 2); i <= Math.min(totalPages, currentPage + 1); i++) {
    pageNumbers.push(i);
  }

  return (
    <div className="d-flex justify-content-center mt-3">
      <Pagination>
        <PaginationItem disabled={currentPage === 1}>
          <PaginationLink onClick={() => onPageChange(currentPage - 1)}>
            <FaChevronLeft />
          </PaginationLink>
        </PaginationItem>
        {pageNumbers.map((number) => (
          <PaginationItem key={number} active={number === currentPage}>
            <PaginationLink onClick={() => onPageChange(number)}>
              {number}
            </PaginationLink>
          </PaginationItem>
        ))}
        <PaginationItem disabled={currentPage === totalPages}>
          <PaginationLink onClick={() => onPageChange(currentPage + 1)}>
            <FaChevronRight />
          </PaginationLink>
        </PaginationItem>
      </Pagination>
    </div>
  );
};

export default Paginations;
