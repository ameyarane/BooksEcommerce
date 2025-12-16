using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using BooksEcommerce.Core.Models;
using Microsoft.EntityFrameworkCore;

namespace BooksEcommerce.Data
{
    public class BooksDbContext : DbContext
    {
        public BooksDbContext(DbContextOptions<BooksDbContext> options) : base(options) { }
        public DbSet<Book> Books { get; set; }
    }
}