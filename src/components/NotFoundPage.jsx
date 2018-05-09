import React from 'react';
import { Link } from 'react-router-dom';

function NotFoundPage() {
  return (
    <div id="react-content">
      <div id="page-404">
        <section>
          <h1>404</h1>
          <p>
            <Link to="/">返回首页</Link>
          </p>
        </section>
      </div>
    </div>
  );
}
export default NotFoundPage;
