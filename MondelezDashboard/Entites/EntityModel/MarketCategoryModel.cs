using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Entites.EntityModel
{
    public class MarketCategoryModel
    {
        public List<Marketddl> marketddl { get; set; }
        public List<Categoryddl> categoryddl { get; set; }
        public string kpiddl { get; set; }
    }
    public class Marketddl
    {
        public string CountryName { get; set; }
        public int CountryId { get; set; }
        public int IsSelectable { get; set; }
    }
    public class Categoryddl
    {
        public string CategoryName { get; set; }
        public int CategoryId { get; set; }
        public int CountryId { get; set; }
        public int IsSelectable { get; set; }
    }
   
}
